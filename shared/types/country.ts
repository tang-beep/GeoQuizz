import { Continent } from "./continents";

export interface Country {
  code: string

  names: string[]
  capitals: string[]

  continent: Continent
  flag: string
}