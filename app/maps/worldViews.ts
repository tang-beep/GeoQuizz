import type { MapView } from "./mapConfig";

export const continentViews: 
  Record<string, MapView> = {
    europe: {
      x: 950,
      y: 180,
      zoom: 3
    },

    africa: {
      x: 1000,
      y: 350,
      zoom: 2.5
    },

    asia: {
      x: 1350,
      y: 220,
      zoom: 2.3
    },

    northAmerica: {
      x: 420,
      y: 220,
      zoom: 2.5
    },

    southAmerica: {
      x: 620,
      y: 520,
      zoom: 3
    },

    oceania: {
      x: 1650,
      y: 520,
      zoom: 4
    }
  }