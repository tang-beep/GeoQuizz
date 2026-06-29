export const continents = [
  'europe',
  'africa',
  'asia',
  'northAmerica',
  'southAmerica',
  'oceania'
] as const

export type Continent = (typeof continents)[number]