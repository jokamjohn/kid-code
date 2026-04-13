import type { AgeGroup } from '@/types/user'

export function getAgeGroup(age: number): AgeGroup {
  if (age <= 9) return 'young'
  if (age <= 12) return 'middle'
  return 'older'
}

export function getAgeGroupLabel(group: AgeGroup): string {
  return { young: 'Explorer (6–9)', middle: 'Builder (10–12)', older: 'Creator (13–14)' }[group]
}
