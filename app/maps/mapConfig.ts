
export interface MapView {
  x: number
  y: number
  zoom: number
}

export interface MapConfig {
  width: number
  height: number

  svgPath: string

  minZoom: number
  maxZoom: number

  defaultView: MapView
}