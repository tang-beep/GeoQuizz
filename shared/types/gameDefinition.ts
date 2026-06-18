import type { GameElement } from './game'

export interface GameCountry {
  code: string

  flagChoices: string[]
}

export interface GameDefinition {
  continent: string | null

  countriesCount: number

  startElement: GameElement

  targetElements: GameElement[]

  countries: GameCountry[]
}