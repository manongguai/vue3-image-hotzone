<template>
  <div
    class="hotzone-wrapper"
    ref="wrapperRef"
    @mousedown="onWrapperMouseDown"
    @touchstart.prevent="onWrapperTouchStart"
  >
    <img
      :src="src"
      ref="imgRef"
      @load="updateSize"
      draggable="false"
      alt=""
    />

    <!-- 绘制中的矩形 -->
    <div
      v-if="drawing"
      class="drawing-rect"
      :style="drawingStyle"
    ></div>

    <!-- 已创建的热区 -->
    <div
      v-for="zone in localZones"
      :key="zone.id"
      class="zone-rect"
      :class="{
        active: activeZone === zone.id,
        hover: hoveredZone === zone.id && activeZone !== zone.id
      }"
      :style="getZoneStyle(zone)"
      @mousedown.stop="onZoneMouseDown($event, zone)"
      @mouseenter="onZoneMouseEnter(zone)"
      @mouseleave="onZoneMouseLeave(zone)"
      @touchstart.stop.prevent="onZoneTouchStart($event, zone)"
    >
      <!-- 标签居中显示 -->
      <span
        v-if="mergedConfig.showLabel && (zone.label || zone.title)"
        class="zone-label"
        :style="getLabelStyle(zone)"
      >
        {{ zone.label || zone.title || '' }}
      </span>

      <!-- 8个拖拽手柄 -->
      <template v-if="mergedConfig.enableResize && mergedConfig.showHandles">
        <span
          v-for="handle in handles"
          :key="handle"
          :class="['handle', handle]"
          :style="getHandleStyle(zone)"
          @mousedown.stop="onHandleMouseDown($event, zone, handle)"
          @touchstart.stop.prevent="onHandleTouchStart($event, zone, handle)"
        ></span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useHotzone } from '../composables/useHotzone'
import { useDrawing } from '../composables/useDrawing'
import { useDragging } from '../composables/useDragging'
import { useEvents } from '../composables/useEvents'

const props = defineProps({
  src: { type: String, required: true },
  zones: { type: Array, default: () => [] },
  theme: { type: Object, default: () => ({}) },
  config: { type: Object, default: () => ({}) }
})

const emit = defineEmits([
  'update:zones', 'change',
  'zone-created', 'zone-updated', 'zone-deleted',
  'zone-click', 'zone-focus', 'zone-hover', 'zone-leave',
  'draw-start', 'drawing', 'draw-end',
  'drag-start', 'moving', 'resizing', 'drag-end',
  'max-reached', 'selection-cleared', 'all-cleared',
  'zones-imported', 'resize', 'zone-deleted-by-keyboard'
])

// Refs
const wrapperRef = ref(null)
const imgRef = ref(null)
const wrapperWidth = ref(0)
const wrapperHeight = ref(0)
const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
let resizeTimer = null

// 默认配置
const defaultTheme = {
  drawingLineColor: '#4f6ef7',
  drawingLineWidth: 2,
  drawingFillColor: 'rgba(79, 110, 247, 0.15)',
  zoneBorderColor: '#4f6ef7',
  zoneBorderWidth: 2,
  zoneFillColor: 'rgba(79, 110, 247, 0.2)',
  zoneBorderStyle: 'solid',
  zoneOpacity: 1,
  zoneActiveBorderColor: '#e53e3e',
  zoneActiveFillColor: 'rgba(229, 62, 62, 0.15)',
  zoneActiveBorderStyle: 'solid',
  zoneActiveShadow: '0 0 0 2px rgba(229, 62, 62, 0.3)',
  zoneHoverBorderColor: '#718096',
  zoneHoverFillColor: 'rgba(113, 128, 150, 0.2)',
  handleSize: 10,
  handleColor: '#ffffff',
  handleBorderColor: '#4f6ef7',
  handleBorderWidth: 2,
  handleActiveBorderColor: '#e53e3e',
  handleHoverColor: '#4f6ef7',
  handleActiveHoverColor: '#e53e3e',
  handleBorderRadius: '3px',
  handleShadow: '0 1px 4px rgba(0,0,0,0.15)',
  labelColor: '#333333',
  labelFontSize: '12px',
  labelFontWeight: '600',
  labelBackgroundColor: 'transparent',
  labelPadding: '2px 4px',
  labelBorderRadius: '0px',
  labelMaxWidth: '90%',
  labelTextShadow: 'none',
  transitionDuration: '0s',
  transitionTiming: 'ease'
}

const defaultConfig = {
  minSize: 2,
  maxZones: 20,
  showLabel: true,
  enableResize: true,
  enableMove: true,
  enableDraw: true,
  enableDelete: true,
  showHandles: true,
  allowOverlap: true,
  snapToGrid: false,
  gridSize: 5,
  useAnimationFrame: true,
  debounceUpdate: true
}

const themeConfig = computed(() => ({ ...defaultTheme, ...props.theme }))
const mergedConfig = computed(() => ({ ...defaultConfig, ...props.config }))

// 容器尺寸
const updateSize = () => {
  if (wrapperRef.value) {
    const oldWidth = wrapperWidth.value
    const oldHeight = wrapperHeight.value
    wrapperWidth.value = wrapperRef.value.offsetWidth
    wrapperHeight.value = wrapperRef.value.offsetHeight
    
    if (oldWidth !== wrapperWidth.value || oldHeight !== wrapperHeight.value) {
      emit('resize', { width: wrapperWidth.value, height: wrapperHeight.value })
    }
  }
}

const onResize = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(updateSize, 100)
}

const getContainerSize = () => ({
  width: wrapperWidth.value,
  height: wrapperHeight.value
})

// 事件管理
const { bindDrawEvents, unbindDrawEvents, bindDragEvents, unbindDragEvents, cleanup } = useEvents()

// 热区管理
const hotzone = useHotzone(props, emit)
const {
  localZones, activeZone, hoveredZone,
  addZone, addZones, updateZone, removeZone, setActiveZone,
  getActiveZone, getZone, getAllZones,
  clearAll, exportZones, importZones,
  disableZone, enableZone, hideZone, showZone
} = hotzone

// 绘制配置
const drawingConfig = reactive({
  get wrapperRef() { return wrapperRef.value },
  useAnimationFrame: mergedConfig.value.useAnimationFrame,
  minSize: mergedConfig.value.minSize,
  snapToGrid: mergedConfig.value.snapToGrid,
  gridSize: mergedConfig.value.gridSize,
  zoneCount: hotzone.zoneCount
})

const drawing = useDrawing(emit, getContainerSize, drawingConfig)
const { drawing: isDrawing, drawStart, drawCurrent, startDraw: beginDraw, onDrawMove: handleDrawMove, finishDraw: endDraw, cancelDraw } = drawing

// 拖拽配置
const draggingConfig = reactive({
  get wrapperRef() { return wrapperRef.value },
  useAnimationFrame: mergedConfig.value.useAnimationFrame,
  minSize: mergedConfig.value.minSize
})

const dragging = useDragging(emit, getContainerSize, draggingConfig)
const { dragData, startDrag, onDragMove: handleDragMove, finishDrag: endDrag, cancelDrag } = dragging

// 同步配置
watch(() => mergedConfig.value, (newConfig) => {
  Object.assign(drawingConfig, {
    useAnimationFrame: newConfig.useAnimationFrame,
    minSize: newConfig.minSize,
    snapToGrid: newConfig.snapToGrid,
    gridSize: newConfig.gridSize
  })
  Object.assign(draggingConfig, {
    useAnimationFrame: newConfig.useAnimationFrame,
    minSize: newConfig.minSize
  })
})

watch(() => hotzone.zoneCount, (count) => {
  drawingConfig.zoneCount = count
})

// 样式计算
const drawingStyle = computed(() => {
  if (!isDrawing.value) return { display: 'none' }
  const x1 = drawStart.x
  const y1 = drawStart.y
  const x2 = drawCurrent.x
  const y2 = drawCurrent.y
  
  return {
    left: Math.min(x1, x2) + 'px',
    top: Math.min(y1, y2) + 'px',
    width: Math.abs(x2 - x1) + 'px',
    height: Math.abs(y2 - y1) + 'px',
    border: `${themeConfig.value.drawingLineWidth}px dashed ${themeConfig.value.drawingLineColor}`,
    backgroundColor: themeConfig.value.drawingFillColor
  }
})

const getZoneStyle = (zone) => {
  const theme = themeConfig.value
  const isActive = activeZone.value === zone.id
  const isHovered = hoveredZone.value === zone.id && !isActive
  
  let borderColor, fillColor, borderStyle, shadow, opacity
  
  if (isActive) {
    borderColor = zone.style?.activeBorderColor || theme.zoneActiveBorderColor
    fillColor = zone.style?.activeFillColor || theme.zoneActiveFillColor
    borderStyle = theme.zoneActiveBorderStyle
    shadow = theme.zoneActiveShadow
    opacity = 1
  } else if (isHovered) {
    borderColor = theme.zoneHoverBorderColor
    fillColor = theme.zoneHoverFillColor
    borderStyle = theme.zoneBorderStyle
    shadow = 'none'
    opacity = 1
  } else {
    borderColor = zone.style?.borderColor || theme.zoneBorderColor
    fillColor = zone.style?.fillColor || theme.zoneFillColor
    borderStyle = theme.zoneBorderStyle
    shadow = 'none'
    opacity = theme.zoneOpacity
  }
  
  return {
    left: (zone.x / 100 * wrapperWidth.value) + 'px',
    top: (zone.y / 100 * wrapperHeight.value) + 'px',
    width: (zone.width / 100 * wrapperWidth.value) + 'px',
    height: (zone.height / 100 * wrapperHeight.value) + 'px',
    border: `${theme.zoneBorderWidth}px ${borderStyle} ${borderColor}`,
    backgroundColor: fillColor,
    boxShadow: shadow,
    opacity: zone.visible !== false ? opacity : 0,
    cursor: zone.disabled ? 'not-allowed' : (mergedConfig.value.enableMove && zone.draggable !== false ? 'move' : 'default'),
    pointerEvents: zone.disabled ? 'none' : 'auto',
    transition: isActive || isHovered ? `box-shadow ${theme.transitionDuration} ${theme.transitionTiming}` : 'none'
  }
}

const getHandleStyle = (zone) => {
  const theme = themeConfig.value
  const isActive = activeZone.value === zone.id
  
  if (!mergedConfig.value.showHandles) {
    return { display: 'none' }
  }
  
  return {
    width: theme.handleSize + 'px',
    height: theme.handleSize + 'px',
    backgroundColor: theme.handleColor,
    border: `${theme.handleBorderWidth}px solid ${isActive ? theme.handleActiveBorderColor : theme.handleBorderColor}`,
    borderRadius: theme.handleBorderRadius,
    boxShadow: theme.handleShadow,
    transition: 'none'
  }
}

const getLabelStyle = (zone) => {
  const theme = themeConfig.value
  const isActive = activeZone.value === zone.id
  
  return {
    color: zone.style?.labelColor || theme.labelColor,
    fontSize: theme.labelFontSize,
    fontWeight: theme.labelFontWeight,
    backgroundColor: zone.style?.labelBackgroundColor || theme.labelBackgroundColor,
    padding: theme.labelPadding,
    borderRadius: theme.labelBorderRadius,
    maxWidth: theme.labelMaxWidth,
    textShadow: theme.labelTextShadow,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
    pointerEvents: 'none',
    zIndex: 25,
    lineHeight: '1.2',
    opacity: isActive ? 1 : 0.8
  }
}

// 事件处理
const onWrapperMouseDown = (e) => {
  if (e.button !== 0) return
  if (!mergedConfig.value.enableDraw) return
  
  beginDraw(e)
  bindDrawEvents(handleDrawMove, () => {
    const newZone = endDraw()
    if (newZone) {
      addZone(newZone)
    }
  })
}

const onWrapperTouchStart = (e) => {
  if (!mergedConfig.value.enableDraw) return
  
  beginDraw(e)
  bindDrawEvents(handleDrawMove, () => {
    const newZone = endDraw()
    if (newZone) {
      addZone(newZone)
    }
  })
}

const onZoneMouseDown = (e, zone) => {
  if (e.button !== 0) return
  if (!mergedConfig.value.enableMove) return
  if (zone.disabled || zone.draggable === false) return
  
  activeZone.value = zone.id
  emit('zone-click', { ...zone })
  
  startDrag(e, zone)
  bindDragEvents(
    (e) => handleDragMove(e, localZones.value),
    () => endDrag(localZones.value)
  )
}

const onZoneTouchStart = (e, zone) => {
  if (!mergedConfig.value.enableMove) return
  if (zone.disabled || zone.draggable === false) return
  
  activeZone.value = zone.id
  emit('zone-click', { ...zone })
  
  startDrag(e, zone)
  bindDragEvents(
    (e) => handleDragMove(e, localZones.value),
    () => endDrag(localZones.value)
  )
}

const onHandleMouseDown = (e, zone, handle) => {
  if (e.button !== 0) return
  if (!mergedConfig.value.enableResize) return
  if (zone.disabled || zone.resizable === false) return
  
  startDrag(e, zone, handle)
  bindDragEvents(
    (e) => handleDragMove(e, localZones.value),
    () => endDrag(localZones.value)
  )
}

const onHandleTouchStart = (e, zone, handle) => {
  if (!mergedConfig.value.enableResize) return
  if (zone.disabled || zone.resizable === false) return
  
  startDrag(e, zone, handle)
  bindDragEvents(
    (e) => handleDragMove(e, localZones.value),
    () => endDrag(localZones.value)
  )
}

const onZoneMouseEnter = (zone) => {
  hoveredZone.value = zone.id
  emit('zone-hover', { ...zone })
}

const onZoneMouseLeave = (zone) => {
  if (hoveredZone.value === zone.id) {
    hoveredZone.value = null
    emit('zone-leave', { ...zone })
  }
}

// 键盘事件
const onKeyDown = (e) => {
  if ((e.key === 'Delete' || e.key === 'Backspace') && activeZone.value) {
    if (mergedConfig.value.enableDelete) {
      e.preventDefault()
      removeZone(activeZone.value)
      emit('zone-deleted-by-keyboard', activeZone.value)
    }
  }
  
  if (e.key === 'Escape') {
    activeZone.value = null
    cancelDraw()
    cancelDrag()
    emit('selection-cleared')
  }
}

// ========== 关键：暴露方法给父组件 ==========
defineExpose({
  addZone,
  addZones,
  updateZone,
  removeZone,
  setActiveZone,
  getActiveZone,
  getZone,
  getAllZones,
  clearAll,
  exportZones,
  importZones,
  disableZone,
  enableZone,
  hideZone,
  showZone,
  getSize: getContainerSize
})

// 生命周期
onMounted(() => {
  nextTick(updateSize)
  window.addEventListener('resize', onResize)
  document.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  document.removeEventListener('keydown', onKeyDown)
  clearTimeout(resizeTimer)
  cleanup()
})
</script>

<style scoped>
.hotzone-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  cursor: crosshair;
  line-height: 0;
  user-select: none;
}

.hotzone-wrapper img {
  width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
  user-select: none;
}

.drawing-rect {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 5;
}

.zone-rect {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  z-index: 10;
}

.zone-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  pointer-events: none;
  z-index: 25;
}

.handle {
  position: absolute;
  z-index: 20;
  box-sizing: border-box;
}

/* 手柄位置 */
.handle.nw { top: -5px; left: -5px; cursor: nw-resize; }
.handle.n  { top: -5px; left: calc(50% - 5px); cursor: n-resize; }
.handle.ne { top: -5px; right: -5px; cursor: ne-resize; }
.handle.e  { top: calc(50% - 5px); right: -5px; cursor: e-resize; }
.handle.se { bottom: -5px; right: -5px; cursor: se-resize; }
.handle.s  { bottom: -5px; left: calc(50% - 5px); cursor: s-resize; }
.handle.sw { bottom: -5px; left: -5px; cursor: sw-resize; }
.handle.w  { top: calc(50% - 5px); left: -5px; cursor: w-resize; }
</style>