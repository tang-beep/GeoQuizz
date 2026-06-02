export type GameElement =
  | 'flag'
  | 'country'
  | 'capital'
  | 'map'

export interface GameSettings {
  numberOfCountries: number

  continent: string | null

  startElement: GameElement

  targetElements: GameElement[]
}