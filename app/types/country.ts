import type { Continent } from "~/maps/worldViews"

export interface Country {
  code: string

  names: string[]
  capitals: string[]

  continent: Continent
  flag: string
}