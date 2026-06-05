import type { MapConfig } from "./mapConfig";
import { worldView } from "./worldViews";

export const worldMap: MapConfig = {
  width: 2000,
  height: 857,

  svgPath: '/map/world.svg',

  minZoom: 1,
  maxZoom: 40,

  defaultView: worldView
}