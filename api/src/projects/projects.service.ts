import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

export interface CreateProjectInput {
  userId: string;
  name: string;
  type: 'html' | 'javascript' | 'css' | 'blocks';
}

export interface UpsertFileInput {
  projectId: string;
  userId: string;
  filename: string;
  content: string;
}

@Injectable()
export class ProjectsService {
  constructor(private readonly supabase: SupabaseService) {}

  async listProjects(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('projects')
      .select('id, name, type, github_repo, last_pushed_at, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async getProject(projectId: string, userId: string) {
    const { data: project, error } = await this.supabase.admin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error || !project) throw new NotFoundException('Project not found');

    const { data: files } = await this.supabase.admin
      .from('project_files')
      .select('id, filename, content, updated_at')
      .eq('project_id', projectId);

    return { project, files: files ?? [] };
  }

  async createProject(input: CreateProjectInput) {
    const defaultFiles = this.getDefaultFiles(input.type);

    const { data: project, error } = await this.supabase.admin
      .from('projects')
      .insert({ user_id: input.userId, name: input.name, type: input.type })
      .select()
      .single();

    if (error || !project) throw error ?? new Error('Failed to create project');

    if (defaultFiles.length > 0) {
      await this.supabase.admin.from('project_files').insert(
        defaultFiles.map(f => ({ project_id: (project as any).id, ...f })),
      );
    }

    return project;
  }

  async upsertFile(input: UpsertFileInput) {
    // Verify ownership
    const { data: project } = await this.supabase.admin
      .from('projects')
      .select('id')
      .eq('id', input.projectId)
      .eq('user_id', input.userId)
      .single();

    if (!project) throw new NotFoundException('Project not found');

    const { data, error } = await this.supabase.admin
      .from('project_files')
      .upsert(
        { project_id: input.projectId, filename: input.filename, content: input.content },
        { onConflict: 'project_id,filename' },
      )
      .select()
      .single();

    if (error) throw error;

    // Update project updated_at
    await this.supabase.admin
      .from('projects')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', input.projectId);

    return data;
  }

  async deleteProject(projectId: string, userId: string) {
    const { error } = await this.supabase.admin
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) throw error;
    return { ok: true };
  }

  async setGithubRepo(projectId: string, userId: string, repoName: string) {
    await this.supabase.admin
      .from('projects')
      .update({ github_repo: repoName, last_pushed_at: new Date().toISOString() })
      .eq('id', projectId)
      .eq('user_id', userId);
  }

  private getDefaultFiles(type: string): { filename: string; content: string }[] {
    if (type === 'html') {
      return [
        {
          filename: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Project</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Hello, World! 🌍</h1>
  <p>Edit this file to get started!</p>
  <script src="script.js"></script>
</body>
</html>`,
        },
        {
          filename: 'style.css',
          content: `body {
  font-family: sans-serif;
  background: #f0f4ff;
  color: #333;
  text-align: center;
  padding: 2rem;
}

h1 {
  color: #6c47ff;
}`,
        },
        {
          filename: 'script.js',
          content: `// Your JavaScript goes here!
console.log('Hello from script.js 🚀');`,
        },
      ];
    }
    if (type === 'javascript') {
      return [
        {
          filename: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>JS Project</title></head>
<body>
  <div id="app"></div>
  <script src="script.js"></script>
</body>
</html>`,
        },
        {
          filename: 'script.js',
          content: `// JavaScript project
const app = document.getElementById('app');
app.innerHTML = '<h1>My JS App 🚀</h1>';`,
        },
      ];
    }
    return [];
  }
}
