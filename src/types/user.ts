export type AgeGroup = 'young' | 'middle' | 'older'
export type UserRole = 'student' | 'parent' | 'teacher'

export interface Profile {
  id: string
  username: string
  displayName: string
  age: number
  ageGroup: AgeGroup
  role: UserRole
  parentId?: string
  githubUsername?: string
  avatarUrl?: string
  createdAt: string
}
