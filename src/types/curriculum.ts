export type SubjectId = 'computing' | 'html' | 'css' | 'javascript'

export interface Subject {
  id: SubjectId
  title: string
  description: string
  icon: string
  color: string
  bgColor: string
  topics: Topic[]
}

export interface Topic {
  id: string
  subjectId: SubjectId
  title: string
  description: string
  duration: string
  difficulty: 1 | 2 | 3
  sections: Section[]
}

export interface Section {
  type: 'text' | 'code' | 'visual' | 'try-it'
  content: string
  language?: string
}
