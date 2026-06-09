import type { MapView } from "./mapConfig";

export const worldView: MapView = {
  x: 610,
  y: 260,
  zoom: 1.1
}

export const continents = [
  'europe',
  'africa',
  'asia',
  'northAmerica',
  'southAmerica',
  'oceania'
] as const

export type Continent =
  (typeof continents)[number]

export const continentViews: 
  Record<Continent, MapView> = {
    europe: {
      x: 520,
      y: 100,
      zoom: 3.5
    },

    africa: {
      x: 570,
      y: 291,
      zoom: 2.5
    },

    asia: {
      x: 775,
      y: 185,
      zoom: 2.1
    },

    northAmerica: {
      x: 260,
      y: 150,
      zoom: 2.5
    },

    southAmerica: {
      x: 330,
      y: 370,
      zoom: 2.6
    },

    oceania: {
      x: 1005,
      y: 365,
      zoom: 3
    }
  }