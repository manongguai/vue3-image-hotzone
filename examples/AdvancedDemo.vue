<template>
  <div class="demo">
    <h1>Vue3 图片热区组件 - 高级示例</h1>
    
    <!-- 主题选择 -->
    <div class="panel">
      <h3>主题切换</h3>
      <div class="theme-buttons">
        <button 
          v-for="t in themes" 
          :key="t.name"
          :class="{ active: currentTheme === t.name }"
          @click="switchTheme(t.name)"
        >
          <span class="theme-dot" :style="{ background: t.color }"></span>
          {{ t.label }}
        </button>
      </div>
    </div>
    
    <!-- 工具栏 -->
    <div class="panel">
      <h3>操作</h3>
      <div class="toolbar">
        <button @click="addHotzone">添加热区</button>
        <button @click="addMultipleHotzones">批量添加</button>
        <button @click="updateActiveZone">更新选中</button>
        <button @click="disableActiveZone">禁用选中</button>
        <button @click="hideActiveZone">隐藏选中</button>
        <button @click="exportData">导出</button>
        <button @click="importData">导入</button>
        <button @click="clearAll">清除全部</button>
      </div>
    </div>
    
    <!-- 热区组件 -->
    <div class="panel">
      <h3>编辑区域</h3>
      <ImageHotzone
        ref="hotzoneRef"
        :src="imageUrl"
        v-model:zones="zones"
        :theme="theme"
        :config="config"
        @zone-created="onZoneCreated"
        @zone-updated="onZoneUpdated"
        @zone-deleted="onZoneDeleted"
        @zone-click="onZoneClick"
        @zone-focus="onZoneFocus"
        @max-reached="onMaxReached"
      />
    </div>
    
    <!-- 热区列表 -->
    <div class="panel">
      <h3>热区列表 ({{ zones.length }})</h3>
      <div v-if="zones.length === 0" class="empty">暂无热区</div>
      <div 
        v-for="zone in zones" 
        :key="zone.id" 
        class="zone-item"
        :class="{ active: activeZoneId === zone.id }"
        @click="selectZone(zone.id)"
      >
        <div>
          <strong>{{ zone.label }}</strong>
          <span v-if="zone.disabled" class="badge">禁用</span>
          <span v-if="!zone.visible" class="badge">隐藏</span>
        </div>
        <div class="zone-info">
          ({{ zone.x.toFixed(1) }}%, {{ zone.y.toFixed(1) }}%) 
          {{ zone.width.toFixed(1) }}% × {{ zone.height.toFixed(1) }}%
        </div>
        <div class="zone-actions" @click.stop>
          <button @click="toggleDisable(zone.id)">
            {{ zone.disabled ? '启用' : '禁用' }}
          </button>
          <button @click="toggleVisible(zone.id)">
            {{ zone.visible ? '隐藏' : '显示' }}
          </button>
          <button @click="removeZone(zone.id)">删除</button>
        </div>
      </div>
    </div>
    
    <!-- 事件日志 -->
    <div class="panel">
      <h3>事件日志</h3>
      <button @click="logs = []" style="margin-bottom:10px;">清空日志</button>
      <div class="log-list">
        <div v-for="(log, i) in logs" :key="i" class="log-item">
          <span class="log-time">{{ log.time }}</span>
          {{ log.message }}
        </div>
        <div v-if="logs.length === 0" class="empty">暂无日志</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ImageHotzone from '../src/components/ImageHotzone.vue'

const hotzoneRef = ref(null)
const imageUrl = ref('https://picsum.photos/id/1015/800/500')
const zones = ref([])
const currentTheme = ref('default')
const logs = ref([])

const config = ref({
  minSize: 2,
  maxZones: 20,
  showLabel: true,
  enableResize: true,
  enableMove: true,
  enableDraw: true,
  showHandles: true
})

// 主题配置
const themes = [
  { name: 'default', label: '默认蓝色', color: '#4f6ef7', theme: {} },
  { 
    name: 'dark', label: '暗色主题', color: '#718096',
    theme: {
      zoneBorderColor: '#718096',
      zoneFillColor: 'rgba(113, 128, 150, 0.2)',
      zoneActiveBorderColor: '#fbd38d',
      zoneActiveFillColor: 'rgba(251, 211, 141, 0.15)',
      labelColor: '#e2e8f0'
    }
  },
  {
    name: 'green', label: '绿色主题', color: '#48bb78',
    theme: {
      zoneBorderColor: '#38a169',
      zoneFillColor: 'rgba(56, 161, 105, 0.2)',
      zoneActiveBorderColor: '#f56565',
      zoneActiveFillColor: 'rgba(245, 101, 101, 0.15)'
    }
  },
  {
    name: 'ocean', label: '海洋主题', color: '#00b4d8',
    theme: {
      zoneBorderColor: '#0077b6',
      zoneFillColor: 'rgba(0, 119, 182, 0.2)',
      zoneActiveBorderColor: '#ff6b6b',
      handleBorderRadius: '50%',
      handleSize: 12
    }
  }
]

const theme = computed(() => {
  const t = themes.find(t => t.name === currentTheme.value)
  return t?.theme || {}
})

const activeZoneId = computed(() => hotzoneRef.value?.getActiveZone()?.id)

const switchTheme = (name) => {
  currentTheme.value = name
  addLog(`切换主题: ${name}`)
}

const addLog = (message) => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift({ time, message })
  if (logs.value.length > 50) logs.value.pop()
}

const addHotzone = () => {
  hotzoneRef.value?.addZone({
    x: 35, y: 35, width: 30, height: 30,
    label: `热区-${Date.now() % 1000}`
  })
  addLog('添加热区')
}

const addMultipleHotzones = () => {
  hotzoneRef.value?.addZones([
    { x: 10, y: 10, width: 20, height: 20, label: '区域A' },
    { x: 40, y: 40, width: 20, height: 20, label: '区域B' },
    { x: 70, y: 60, width: 15, height: 20, label: '区域C' }
  ])
  addLog('批量添加3个热区')
}

const updateActiveZone = () => {
  const zone = hotzoneRef.value?.getActiveZone()
  if (!zone) {
    alert('请先选择一个热区')
    return
  }
  hotzoneRef.value?.updateZone(zone.id, {
    label: '已更新-' + Date.now() % 100,
    style: {
      borderColor: '#f6ad55',
      fillColor: 'rgba(246, 173, 85, 0.3)'
    }
  })
  addLog('更新热区: ' + zone.label)
}

const disableActiveZone = () => {
  const zone = hotzoneRef.value?.getActiveZone()
  if (!zone) return
  hotzoneRef.value?.disableZone(zone.id)
  addLog('禁用热区: ' + zone.label)
}

const hideActiveZone = () => {
  const zone = hotzoneRef.value?.getActiveZone()
  if (!zone) return
  hotzoneRef.value?.hideZone(zone.id)
  addLog('隐藏热区: ' + zone.label)
}

const exportData = () => {
  const data = hotzoneRef.value?.exportZones()
  console.log(JSON.stringify(data, null, 2))
  addLog(`导出 ${data?.length || 0} 个热区`)
}

const importData = () => {
  const json = prompt('粘贴JSON数据:')
  if (json) {
    try {
      const data = JSON.parse(json)
      hotzoneRef.value?.importZones(data)
      addLog(`导入 ${data.length} 个热区`)
    } catch (e) {
      alert('解析失败')
    }
  }
}

const clearAll = () => {
  if (confirm('确定？')) {
    hotzoneRef.value?.clearAll()
    addLog('清除全部热区')
  }
}

const selectZone = (id) => {
  hotzoneRef.value?.setActiveZone(id)
}

const removeZone = (id) => {
  hotzoneRef.value?.removeZone(id)
  addLog('删除热区')
}

const toggleDisable = (id) => {
  const zone = hotzoneRef.value?.getZone(id)
  if (zone) {
    if (zone.disabled) {
      hotzoneRef.value?.enableZone(id)
    } else {
      hotzoneRef.value?.disableZone(id)
    }
  }
}

const toggleVisible = (id) => {
  const zone = hotzoneRef.value?.getZone(id)
  if (zone) {
    if (zone.visible) {
      hotzoneRef.value?.hideZone(id)
    } else {
      hotzoneRef.value?.showZone(id)
    }
  }
}

const onZoneCreated = (zone) => addLog(`创建: ${zone.label}`)
const onZoneUpdated = (zone) => addLog(`更新: ${zone.label}`)
const onZoneDeleted = (zone) => addLog(`删除: ${zone.label}`)
const onZoneClick = (zone) => addLog(`点击: ${zone.label}`)
const onZoneFocus = (zone) => addLog(`选中: ${zone.label}`)
const onMaxReached = (max) => {
  addLog(`达到上限: ${max}`)
  alert(`最多只能添加 ${max} 个热区`)
}
</script>

<style>
body {
  margin: 0;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  background: #f5f7fa;
}

.demo {
  max-width: 1000px;
  margin: 0 auto;
}

h1 { font-size: 24px; color: #1a202c; margin-bottom: 20px; }
h3 { font-size: 16px; color: #4a5568; margin-bottom: 12px; }

.panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.theme-buttons {
  display: flex; gap: 10px; flex-wrap: wrap;
}

.theme-buttons button {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  background: #edf2f7;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.theme-buttons button.active {
  border-color: #4f6ef7;
  background: #ebf4ff;
  color: #4f6ef7;
  font-weight: 600;
}

.theme-dot {
  width: 16px; height: 16px; border-radius: 50%;
}

.toolbar {
  display: flex; gap: 8px; flex-wrap: wrap;
}

.toolbar button {
  padding: 8px 14px;
  background: #4f6ef7;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.toolbar button:hover { background: #3b5de7; }

.zone-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 14px;
  gap: 10px;
}

.zone-item.active {
  border-color: #4f6ef7;
  background: #ebf4ff;
}

.zone-item:hover { border-color: #cbd5e0; }

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: #fed7d7;
  color: #c53030;
  margin-left: 8px;
}

.zone-info { color: #718096; font-size: 13px; }

.zone-actions { display: flex; gap: 6px; }

.zone-actions button {
  padding: 4px 10px;
  background: #edf2f7;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.zone-actions button:hover { background: #e2e8f0; }

.zone-actions button:last-child {
  background: #fff5f5;
  color: #e53e3e;
  border-color: #fed7d7;
}

.empty {
  color: #a0aec0;
  font-style: italic;
  padding: 20px;
  text-align: center;
}

.log-list {
  max-height: 200px;
  overflow-y: auto;
  background: #1a202c;
  border-radius: 8px;
  padding: 12px;
  font-family: monospace;
}

.log-item {
  color: #68d391;
  font-size: 12px;
  padding: 2px 0;
}

.log-time { color: #718096; margin-right: 10px; }
</style>