import { reactive, ref } from 'vue'
import { getMousePos, clamp } from '../utils'

export function useDragging(emit, getContainerSize, config) {
  const dragData = ref(null)
  let rafId = null
  
  const startDrag = (e, zone, handle = null) => {
    const pos = getMousePos(e, config.wrapperRef)
    
    dragData.value = {
      zoneId: zone.id,
      startMouse: { x: pos.x, y: pos.y },
      startZone: { ...zone },
      handle
    }
    
    emit('drag-start', {
      zone: { ...zone },
      handle,
      type: handle ? 'resize' : 'move'
    })
  }
  
  const onDragMove = (e, zones) => {
    if (!dragData.value) return
    
    if (config.useAnimationFrame) {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        processDrag(e, zones)
      })
    } else {
      processDrag(e, zones)
    }
  }
  
  const processDrag = (e, zones) => {
    if (!dragData.value) return
    
    const pos = getMousePos(e, config.wrapperRef)
    const size = getContainerSize()
    
    const dx = ((pos.x - dragData.value.startMouse.x) / size.width) * 100
    const dy = ((pos.y - dragData.value.startMouse.y) / size.height) * 100
    
    const zoneIndex = zones.findIndex(z => z.id === dragData.value.zoneId)
    if (zoneIndex === -1) {
      dragData.value = null
      return
    }
    
    const zone = { ...zones[zoneIndex] }
    const start = dragData.value.startZone
    const minSize = config.minSize || 2
    
    if (dragData.value.handle) {
      // 调整大小
      const handle = dragData.value.handle
      let { x, y, width, height } = start
      
      if (handle.includes('e')) width += dx
      if (handle.includes('w')) { x += dx; width -= dx }
      if (handle.includes('s')) height += dy
      if (handle.includes('n')) { y += dy; height -= dy }
      
      if (width < minSize) {
        if (handle.includes('w')) x = start.x + start.width - minSize
        width = minSize
      }
      if (height < minSize) {
        if (handle.includes('n')) y = start.y + start.height - minSize
        height = minSize
      }
      
      x = clamp(x, 0, 100 - width)
      y = clamp(y, 0, 100 - height)
      
      zone.x = x
      zone.y = y
      zone.width = width
      zone.height = height
      
      emit('resizing', { zone: { ...zone }, handle, originalZone: { ...start } })
    } else {
      // 移动热区
      let newX = start.x + dx
      let newY = start.y + dy
      
      newX = clamp(newX, 0, 100 - zone.width)
      newY = clamp(newY, 0, 100 - zone.height)
      
      zone.x = newX
      zone.y = newY
      
      emit('moving', { zone: { ...zone }, originalZone: { ...start } })
    }
    
    zones[zoneIndex] = zone
    emit('zone-updated', { ...zone })
    
    return zones
  }
  
  const finishDrag = (zones) => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    
    if (dragData.value) {
      const zone = zones.find(z => z.id === dragData.value.zoneId)
      if (zone) {
        emit('drag-end', {
          zone: { ...zone },
          type: dragData.value.handle ? 'resize' : 'move'
        })
      }
    }
    
    dragData.value = null
  }
  
  const cancelDrag = () => {
    dragData.value = null
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
  
  return {
    dragData,
    startDrag,
    onDragMove,
    finishDrag,
    cancelDrag
  }
}