import type { MapConfig, MapView } from "./mapConfig";

export const worldMap: MapConfig = {
  width: 2000,
  height: 857,

  svgPath: '/map/world.svg',

  minZoom: 1,
  maxZoom: 40,

  defaultView: {
    x: 600,
    y: 250,
    zoom: 1.1
  }
}