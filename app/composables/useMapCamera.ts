import { ref } from 'vue'

import type {
  MapConfig,
  MapView
} from '../maps/mapConfig'

export function useMapCamera(
  map: MapConfig
) {
  const cameraX = ref(
    map.defaultView.x
  )

  const cameraY = ref(
    map.defaultView.y
  )

  const zoom = ref(
    map.defaultView.zoom
  )

  const minZoom =
    map.minZoom

  const maxZoom =
    map.maxZoom

  function zoomTo(
    value: number
  ) {
    zoom.value = Math.min(
      Math.max(
        value,
        minZoom
      ),
      maxZoom
    )
  }

  function zoomIn(
    factor = 1.2
  ) {
    zoomTo(
      zoom.value * factor
    )
  }

  function zoomOut(
    factor = 1.2
  ) {
    zoomTo(
      zoom.value / factor
    )
  }

  function moveBy(
    dx: number,
    dy: number
  ) {
    cameraX.value -=
      dx / zoom.value

    cameraY.value -=
      dy / zoom.value
  }

  function centerOn(
    x: number,
    y: number
  ) {
    cameraX.value = x
    cameraY.value = y
  }

  function zoomToView(
    x: number,
    y: number,
    zoomLevel: number
  ) {
    cameraX.value = x
    cameraY.value = y

    zoomTo(
      zoomLevel
    )
  }

  function applyView(
    view: MapView
  ) {
    zoomToView(
      view.x,
      view.y,
      view.zoom
    )
  }

  function zoomToBounds(
    x: number,
    y: number,
    width: number,
    height: number,
    viewportWidth: number,
    viewportHeight: number
  ) {
    const zoomX =
      viewportWidth / width

    const zoomY =
      viewportHeight / height

    const nextZoom =
      Math.min(
        zoomX,
        zoomY
      ) * 0.8

    cameraX.value =
      x + width / 2

    cameraY.value =
      y + height / 2

    zoomTo(nextZoom)
  }

  function resetView() {
    applyView(
      map.defaultView
    )
  }

  function getTransform(
    viewportWidth: number,
    viewportHeight: number
  ) {
    return `
      translate(
        ${
          viewportWidth / 2 -
          cameraX.value *
            zoom.value
        }px,
        ${
          viewportHeight / 2 -
          cameraY.value *
            zoom.value
        }px
      )
      scale(${zoom.value})
    `
  }

  return {
    zoom,

    cameraX,
    cameraY,

    zoomTo,

    zoomIn,
    zoomOut,

    moveBy,

    centerOn,

    zoomToView,
    applyView,

    zoomToBounds,

    resetView,

    getTransform
  }
}