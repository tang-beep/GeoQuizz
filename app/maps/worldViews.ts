import type { MapView } from "./mapConfig";

export const worldView: MapView = {
  x: 600,
  y: 250,
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
      x: 550,
      y: 100,
      zoom: 3
    },

    africa: {
      x: 600,
      y: 283,
      zoom: 2.5
    },

    asia: {
      x: 790,
      y: 165,
      zoom: 2.2
    },

    northAmerica: {
      x: 310,
      y: 130,
      zoom: 2.5
    },

    southAmerica: {
      x: 350,
      y: 365,
      zoom: 2.6
    },

    oceania: {
      x: 1050,
      y: 380,
      zoom: 3
    }
  }