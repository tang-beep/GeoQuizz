import type { Continent } from "~/maps/worldViews"

export type GameElement =
  | 'flag'
  | 'country'
  | 'capital'
  | 'map'

export interface GameSettings {
  numberOfCountries: number

  continent: Continent | null

  startElement: GameElement

  targetElements: GameElement[]

  dailyChallenge?: boolean
}