import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { SupabaseService } from '../common/supabase.service';

export interface PushFileInput {
  filename: string;
  content: string;
}

export interface PushInput {
  repoName: string;
  commitMessage: string;
  files: PushFileInput[];
  userId: string;
}

export interface CreateRepoInput {
  name: string;
  description?: string;
  isPrivate?: boolean;
  userId: string;
}

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  constructor(private readonly supabase: SupabaseService) {}

  private async getOctokit(userId: string): Promise<Octokit> {
    const { data: profile, error } = await this.supabase.admin
      .from('profiles')
      .select('github_access_token')
      .eq('id', userId)
      .single();

    if (error || !profile?.github_access_token) {
      throw new BadRequestException('GitHub account not connected');
    }

    return new Octokit({ auth: profile.github_access_token });
  }

  async exchangeCodeForToken(code: string, state: string): Promise<string> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error('GitHub OAuth not configured');

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });

    const data = (await response.json()) as { access_token?: string; error?: string };
    if (data.error || !data.access_token) {
      throw new BadRequestException(`GitHub OAuth error: ${data.error ?? 'no token'}`);
    }
    return data.access_token;
  }

  async saveGithubToken(userId: string, token: string, username: string): Promise<void> {
    await this.supabase.admin
      .from('profiles')
      .update({ github_access_token: token, github_username: username })
      .eq('id', userId);
  }

  async getGithubUsername(token: string): Promise<string> {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.rest.users.getAuthenticated();
    return data.login;
  }

  async listRepos(userId: string): Promise<{ name: string; fullName: string; private: boolean }[]> {
    const octokit = await this.getOctokit(userId);
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 50,
      sort: 'updated',
    });
    return data.map(r => ({ name: r.name, fullName: r.full_name, private: r.private }));
  }

  async createRepo(input: CreateRepoInput): Promise<{ name: string; htmlUrl: string }> {
    const octokit = await this.getOctokit(input.userId);
    const { data } = await octokit.rest.repos.createForAuthenticatedUser({
      name: input.name,
      description: input.description ?? 'Created with KidCode 🚀',
      private: input.isPrivate ?? false,
      auto_init: true,
    });
    return { name: data.name, htmlUrl: data.html_url };
  }

  async pushFiles(input: PushInput): Promise<{ commitUrl: string }> {
    const octokit = await this.getOctokit(input.userId);

    // Get authenticated username
    const { data: authUser } = await octokit.rest.users.getAuthenticated();
    const owner = authUser.login;
    const repo = input.repoName;

    // Get current HEAD commit SHA
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: 'heads/main',
    });
    const headSha = refData.object.sha;

    // Get base tree SHA
    const { data: commitData } = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: headSha,
    });
    const baseTreeSha = commitData.tree.sha;

    // Create blobs for each file
    const treeItems = await Promise.all(
      input.files.map(async file => {
        const { data: blob } = await octokit.rest.git.createBlob({
          owner,
          repo,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64',
        });
        return {
          path: file.filename,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blob.sha,
        };
      }),
    );

    // Create tree
    const { data: tree } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: treeItems,
    });

    // Create commit
    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: input.commitMessage,
      tree: tree.sha,
      parents: [headSha],
    });

    // Update ref
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: 'heads/main',
      sha: newCommit.sha,
    });

    this.logger.log(`Pushed to ${owner}/${repo}: ${newCommit.sha}`);
    return { commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}` };
  }
}
