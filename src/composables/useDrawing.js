import { ref, reactive } from 'vue'
import { getMousePos, pxToPercent, generateId, normalizeZone } from '../utils'

export function useDrawing(emit, getContainerSize, config) {
  const drawing = ref(false)
  const drawStart = reactive({ x: 0, y: 0 })
  const drawCurrent = reactive({ x: 0, y: 0 })
  
  let rafId = null
  
  const startDraw = (e) => {
    const pos = getMousePos(e, config.wrapperRef)
    drawing.value = true
    drawStart.x = pos.x
    drawStart.y = pos.y
    drawCurrent.x = pos.x
    drawCurrent.y = pos.y
    
    emit('draw-start', { x: pos.x, y: pos.y })
  }
  
  const onDrawMove = (e) => {
    if (!drawing.value) return
    
    if (config.useAnimationFrame) {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const pos = getMousePos(e, config.wrapperRef)
        drawCurrent.x = pos.x
        drawCurrent.y = pos.y
      })
    } else {
      const pos = getMousePos(e, config.wrapperRef)
      drawCurrent.x = pos.x
      drawCurrent.y = pos.y
    }
  }
  
  const finishDraw = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    
    if (!drawing.value) return
    
    drawing.value = false
    
    const x1 = drawStart.x
    const y1 = drawStart.y
    const x2 = drawCurrent.x
    const y2 = drawCurrent.y
    
    const left = Math.min(x1, x2)
    const top = Math.min(y1, y2)
    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)
    
    const size = getContainerSize()
    const minPx = (config.minSize || 2) / 100 * Math.min(size.width, size.height)
    
    const valid = width >= minPx && height >= minPx
    
    emit('draw-end', { x: left, y: top, width, height, valid })
    
    if (valid) {
      const x = pxToPercent(left, size.width, config.snapToGrid, config.gridSize)
      const y = pxToPercent(top, size.height, config.snapToGrid, config.gridSize)
      const w = pxToPercent(width, size.width, config.snapToGrid, config.gridSize)
      const h = pxToPercent(height, size.height, config.snapToGrid, config.gridSize)
      
      return normalizeZone({
        x, y, width: w, height: h,
        label: `热区${config.zoneCount + 1}`,
        title: `热区${config.zoneCount + 1}`
      })
    }
    
    return null
  }
  
  const cancelDraw = () => {
    drawing.value = false
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
  
  return {
    drawing,
    drawStart,
    drawCurrent,
    startDraw,
    onDrawMove,
    finishDraw,
    cancelDraw
  }
}