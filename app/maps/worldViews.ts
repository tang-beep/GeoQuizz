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
      x: 600,
      y: 283,
      zoom: 2.5
    },

    asia: {
      x: 785,
      y: 165,
      zoom: 2.2
    },

    northAmerica: {
      x: 270,
      y: 130,
      zoom: 2.5
    },

    southAmerica: {
      x: 330,
      y: 365,
      zoom: 2.6
    },

    oceania: {
      x: 995,
      y: 350,
      zoom: 3
    }
  }