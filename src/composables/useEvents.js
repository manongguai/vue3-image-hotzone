import { onBeforeUnmount, ref } from 'vue'

export function useEvents() {
  const drawEventsBound = ref(false)
  const dragEventsBound = ref(false)
  
  // 事件处理函数引用
  let drawMoveHandler = null
  let drawEndHandler = null
  let dragMoveHandler = null
  let dragEndHandler = null
  
  const bindDrawEvents = (onMove, onEnd) => {
    if (drawEventsBound.value) return
    
    drawMoveHandler = (e) => {
      e.preventDefault()
      onMove(e)
    }
    
    drawEndHandler = (e) => {
      onEnd(e)
      unbindDrawEvents()
    }
    
    document.addEventListener('mousemove', drawMoveHandler)
    document.addEventListener('mouseup', drawEndHandler)
    document.addEventListener('touchmove', drawMoveHandler, { passive: false })
    document.addEventListener('touchend', drawEndHandler)
    
    drawEventsBound.value = true
  }
  
  const unbindDrawEvents = () => {
    if (!drawEventsBound.value) return
    
    document.removeEventListener('mousemove', drawMoveHandler)
    document.removeEventListener('mouseup', drawEndHandler)
    document.removeEventListener('touchmove', drawMoveHandler)
    document.removeEventListener('touchend', drawEndHandler)
    
    drawEventsBound.value = false
  }
  
  const bindDragEvents = (onMove, onEnd) => {
    if (dragEventsBound.value) return
    
    dragMoveHandler = (e) => {
      e.preventDefault()
      onMove(e)
    }
    
    dragEndHandler = (e) => {
      onEnd(e)
      unbindDragEvents()
    }
    
    document.addEventListener('mousemove', dragMoveHandler)
    document.addEventListener('mouseup', dragEndHandler)
    document.addEventListener('touchmove', dragMoveHandler, { passive: false })
    document.addEventListener('touchend', dragEndHandler)
    
    dragEventsBound.value = true
  }
  
  const unbindDragEvents = () => {
    if (!dragEventsBound.value) return
    
    document.removeEventListener('mousemove', dragMoveHandler)
    document.removeEventListener('mouseup', dragEndHandler)
    document.removeEventListener('touchmove', dragMoveHandler)
    document.removeEventListener('touchend', dragEndHandler)
    
    dragEventsBound.value = false
  }
  
  const cleanup = () => {
    unbindDrawEvents()
    unbindDragEvents()
  }
  
  onBeforeUnmount(cleanup)
  
  return {
    bindDrawEvents,
    unbindDrawEvents,
    bindDragEvents,
    unbindDragEvents,
    cleanup
  }
}