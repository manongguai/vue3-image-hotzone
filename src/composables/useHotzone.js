import { ref, computed, watch, nextTick } from 'vue'
import { normalizeZone, cleanZoneData } from '../utils'

export function useHotzone(props, emit) {
  const localZones = ref([])
  const activeZone = ref(null)
  const hoveredZone = ref(null)
  const updatingFromParent = ref(false)
  const updatingFromLocal = ref(false)
  
  let updateTimer = null
  
  const zoneCount = computed(() => localZones.value.length)
  
  // 监听外部zones变化
  watch(() => props.zones, (val) => {
    if (updatingFromLocal.value) {
      updatingFromLocal.value = false
      return
    }
    
    updatingFromParent.value = true
    
    if (val && Array.isArray(val)) {
      localZones.value = val.map(z => normalizeZone(z))
    }
    
    nextTick(() => {
      updatingFromParent.value = false
    })
  }, { immediate: true, deep: true })
  
  // 监听内部zones变化
  watch(localZones, (val) => {
    if (updatingFromParent.value) return
    
    if (props.config?.debounceUpdate !== false) {
      clearTimeout(updateTimer)
      updateTimer = setTimeout(() => {
        emitZonesUpdate(val)
      }, 50)
    } else {
      emitZonesUpdate(val)
    }
  }, { deep: true })
  
  const emitZonesUpdate = (val) => {
    updatingFromLocal.value = true
    const cleanZones = val.map(z => cleanZoneData(z))
    emit('update:zones', cleanZones)
    emit('change', cleanZones)
  }
  
  const addZone = (zoneData) => {
    const maxZones = props.config?.maxZones || 20
    if (localZones.value.length >= maxZones) {
      emit('max-reached', maxZones)
      return null
    }
    
    const newZone = normalizeZone({
      id: zoneData.id,
      x: zoneData.x || 10,
      y: zoneData.y || 10,
      width: zoneData.width || 20,
      height: zoneData.height || 20,
      label: zoneData.label || `热区${localZones.value.length + 1}`,
      title: zoneData.title || zoneData.label || `热区${localZones.value.length + 1}`,
      data: zoneData.data || {},
      disabled: zoneData.disabled || false,
      visible: zoneData.visible !== false,
      draggable: zoneData.draggable !== false,
      resizable: zoneData.resizable !== false,
      style: zoneData.style || {}
    })
    
    newZone.x = Math.max(0, Math.min(newZone.x, 100 - newZone.width))
    newZone.y = Math.max(0, Math.min(newZone.y, 100 - newZone.height))
    
    localZones.value.push(newZone)
    activeZone.value = newZone.id
    emit('zone-created', { ...newZone })
    
    return newZone
  }
  
  const addZones = (zonesData) => {
    if (!Array.isArray(zonesData)) return []
    return zonesData.map(data => addZone(data)).filter(Boolean)
  }
  
  const updateZone = (zoneId, updates) => {
    const index = localZones.value.findIndex(z => z.id === zoneId)
    if (index === -1) return false
    
    const zone = { ...localZones.value[index] }
    
    if (updates.x !== undefined) zone.x = Number(updates.x)
    if (updates.y !== undefined) zone.y = Number(updates.y)
    if (updates.width !== undefined) zone.width = Number(updates.width)
    if (updates.height !== undefined) zone.height = Number(updates.height)
    if (updates.label !== undefined) zone.label = updates.label
    if (updates.title !== undefined) zone.title = updates.title
    if (updates.data !== undefined) zone.data = { ...zone.data, ...updates.data }
    if (updates.disabled !== undefined) zone.disabled = updates.disabled
    if (updates.visible !== undefined) zone.visible = updates.visible
    if (updates.draggable !== undefined) zone.draggable = updates.draggable
    if (updates.resizable !== undefined) zone.resizable = updates.resizable
    if (updates.style !== undefined) zone.style = { ...zone.style, ...updates.style }
    
    zone.x = Math.max(0, Math.min(zone.x, 100 - zone.width))
    zone.y = Math.max(0, Math.min(zone.y, 100 - zone.height))
    
    localZones.value[index] = zone
    emit('zone-updated', { ...zone })
    
    return true
  }
  
  const removeZone = (zoneId) => {
    const index = localZones.value.findIndex(z => z.id === zoneId)
    if (index !== -1) {
      const removed = localZones.value.splice(index, 1)[0]
      if (activeZone.value === zoneId) activeZone.value = null
      if (hoveredZone.value === zoneId) hoveredZone.value = null
      emit('zone-deleted', removed)
      return true
    }
    return false
  }
  
  const setActiveZone = (zoneId) => {
    if (zoneId === null) {
      activeZone.value = null
      emit('selection-cleared')
      return
    }
    
    const zone = localZones.value.find(z => z.id === zoneId)
    if (zone) {
      activeZone.value = zoneId
      emit('zone-focus', { ...zone })
    }
  }
  
  const getActiveZone = () => {
    if (!activeZone.value) return null
    const zone = localZones.value.find(z => z.id === activeZone.value)
    return zone ? { ...zone } : null
  }
  
  const getZone = (zoneId) => {
    const zone = localZones.value.find(z => z.id === zoneId)
    return zone ? { ...zone } : null
  }
  
  const getAllZones = () => localZones.value.map(z => ({ ...z }))
  
  const clearAll = () => {
    localZones.value = []
    activeZone.value = null
    hoveredZone.value = null
    emit('all-cleared')
  }
  
  const exportZones = () => localZones.value.map(z => cleanZoneData(z))
  
  const importZones = (zonesData) => {
    if (!Array.isArray(zonesData)) return
    clearAll()
    addZones(zonesData)
    emit('zones-imported', localZones.value.length)
  }
  
  const disableZone = (zoneId) => updateZone(zoneId, { disabled: true })
  const enableZone = (zoneId) => updateZone(zoneId, { disabled: false })
  const hideZone = (zoneId) => updateZone(zoneId, { visible: false })
  const showZone = (zoneId) => updateZone(zoneId, { visible: true })
  
  return {
    localZones,
    activeZone,
    hoveredZone,
    zoneCount,
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
    showZone
  }
}