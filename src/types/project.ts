export type ProjectType = 'html' | 'css' | 'javascript' | 'blocks' | 'full'

export interface ProjectFile {
  id: string
  filename: string
  content: string
  updatedAt: string
}

export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  type: ProjectType
  isPublic: boolean
  githubRepo?: string
  lastPushedAt?: string
  createdAt: string
  updatedAt: string
  files?: ProjectFile[]
}
