<template>
  <div class="demo">
    <h1>Vue3 图片热区组件 - 基础示例</h1>
    
    <div class="toolbar">
      <button @click="addHotzone">添加热区</button>
      <button @click="exportData">导出数据</button>
      <button @click="importData">导入数据</button>
      <button @click="clearAll">清除全部</button>
    </div>
    
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
      @max-reached="onMaxReached"
    />
    
    <div class="zone-list">
      <h3>热区列表 ({{ zones.length }})</h3>
      <div v-if="zones.length === 0" class="empty">暂无热区，请在图片上拖动鼠标绘制</div>
      <div v-for="zone in zones" :key="zone.id" class="zone-item">
        <span>{{ zone.label }}</span>
        <span>位置: ({{ zone.x.toFixed(1) }}%, {{ zone.y.toFixed(1) }}%)</span>
        <span>尺寸: {{ zone.width.toFixed(1) }}% × {{ zone.height.toFixed(1) }}%</span>
        <button @click="selectZone(zone.id)">选择</button>
        <button @click="removeZone(zone.id)">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageHotzone from '../src/components/ImageHotzone.vue'

const hotzoneRef = ref(null)
const imageUrl = ref('https://picsum.photos/id/1015/800/500')
const zones = ref([])
const theme = ref({})
const config = ref({
  minSize: 2,
  maxZones: 20,
  showLabel: true,
  enableResize: true,
  enableMove: true,
  enableDraw: true,
  showHandles: true
})

const addHotzone = () => {
  hotzoneRef.value?.addZone({
    x: 40,
    y: 40,
    width: 20,
    height: 20,
    label: `热区-${Date.now() % 1000}`,
    data: { created: new Date().toISOString() }
  })
}

const exportData = () => {
  const data = hotzoneRef.value?.exportZones()
  if (data) {
    const json = JSON.stringify(data, null, 2)
    console.log(json)
    navigator.clipboard?.writeText(json).then(() => {
      alert('数据已复制到剪贴板')
    }).catch(() => {
      alert('数据已输出到控制台')
    })
  }
}

const importData = () => {
  const json = prompt('请粘贴热区数据（JSON格式）:')
  if (json) {
    try {
      const data = JSON.parse(json)
      hotzoneRef.value?.importZones(data)
      alert(`成功导入 ${data.length} 个热区`)
    } catch (e) {
      alert('JSON解析失败: ' + e.message)
    }
  }
}

const clearAll = () => {
  if (confirm('确定清除所有热区？')) {
    hotzoneRef.value?.clearAll()
  }
}

const selectZone = (id) => {
  hotzoneRef.value?.setActiveZone(id)
}

const removeZone = (id) => {
  hotzoneRef.value?.removeZone(id)
}

const onZoneCreated = (zone) => console.log('创建:', zone)
const onZoneUpdated = (zone) => console.log('更新:', zone)
const onZoneDeleted = (zone) => console.log('删除:', zone)
const onZoneClick = (zone) => console.log('点击:', zone)
const onMaxReached = (max) => alert(`最多只能添加 ${max} 个热区`)
</script>

<style>
body {
  margin: 0;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  background: #f5f7fa;
}

.demo {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  font-size: 24px;
  color: #1a202c;
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.toolbar button {
  padding: 8px 16px;
  background: #4f6ef7;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.toolbar button:hover {
  background: #3b5de7;
}

.zone-list {
  margin-top: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.zone-list h3 {
  margin-bottom: 12px;
  color: #4a5568;
}

.empty {
  color: #a0aec0;
  font-style: italic;
  padding: 20px;
  text-align: center;
}

.zone-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f7fafc;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  gap: 10px;
}

.zone-item button {
  padding: 4px 10px;
  background: #edf2f7;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.zone-item button:hover {
  background: #e2e8f0;
}

.zone-item button:last-child {
  background: #fff5f5;
  color: #e53e3e;
  border-color: #fed7d7;
}

.zone-item button:last-child:hover {
  background: #fed7d7;
}
</style>