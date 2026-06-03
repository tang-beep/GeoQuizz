import type { Continent } from "~/maps/worldViews"

export interface Country {
  code: string
  name: string
  capital: string
  continent: Continent
  flag: string
}