# Vue3 Image Hotzone

一个功能强大的 Vue 3 图片热区编辑组件，支持拖拽绘制、移动、缩放热区，提供丰富的配置选项和事件系统。

基于 Composition API 开发，使用 `<script setup>` 语法，完美支持 Vue 3。

## 特性

- 🖱️ **拖拽绘制** - 在图片上按住鼠标拖拽即可创建热区，支持任意方向滑动
- 📐 **自由缩放** - 8个手柄（四角+四边中点）支持全方位调整热区大小
- 🔄 **拖拽移动** - 点击热区内部可拖拽移动位置
- 📱 **响应式适配** - 基于百分比坐标存储，适配所有分辨率和设备
- 🎨 **主题定制** - 完整的配色系统，支持预设主题和自定义样式
- ⚙️ **灵活配置** - 丰富的配置选项，满足各种业务需求
- 🎯 **独立热区控制** - 支持禁用、隐藏、锁定单个热区
- 📦 **数据导入导出** - 支持 JSON 格式的热区数据导入导出
- ⌨️ **键盘快捷键** - 支持 Delete/Backspace 删除，Escape 取消选择
- ⚡ **高性能** - 使用 requestAnimationFrame 优化拖拽性能，防抖更新
- 🔌 **完善的事件系统** - 覆盖所有交互事件，方便外部监听和处理
- 🏷️ **标签居中显示** - 热区名称居中显示，支持自定义样式
- 🚀 **Composition API** - 使用 Vue 3 Composition API 和 `<script setup>` 语法

## 安装

```bash
npm install vue3-image-hotzone
快速开始
全局注册
javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import Vue3ImageHotzone from 'vue3-image-hotzone'

const app = createApp(App)
app.use(Vue3ImageHotzone)
app.mount('#app')
局部注册
vue
<template>
  <ImageHotzone
    ref="hotzoneRef"
    :src="imageUrl"
    v-model:zones="zones"
    @zone-created="onZoneCreated"
  />
</template>

<script setup>
import { ref } from 'vue'
import ImageHotzone from 'vue3-image-hotzone'

const hotzoneRef = ref(null)
const imageUrl = ref('https://picsum.photos/id/1015/800/500')
const zones = ref([])

// 调用组件方法
const addHotzone = () => {
  hotzoneRef.value?.addZone({
    x: 40, y: 40, width: 20, height: 20,
    label: '新热区'
  })
}

const onZoneCreated = (zone) => {
  console.log('热区创建:', zone)
}
</script>
Vue2 与 Vue3 使用差异
特性	Vue2	Vue3
安装包名	vue2-image-hotzone	vue3-image-hotzone
双向绑定	:zones.sync="zones"	v-model:zones="zones"
模板中组件名	<image-hotzone>	<ImageHotzone> 或 <image-hotzone>
获取组件实例	this.$refs.hotzone	hotzoneRef.value
全局注册	Vue.component()	app.use()
引入方式	import ImageHotzone from 'vue2-image-hotzone'	import ImageHotzone from 'vue3-image-hotzone'
Props 参数
src
类型: String

必填: true

说明: 图片地址

zones / v-model:zones
类型: Array

默认值: []

说明: 热区数据数组，支持 v-model:zones 双向绑定

热区数据结构：

javascript
{
  id: 'unique_id',           // 唯一标识（可选，不传自动生成）
  x: 20,                     // X坐标（百分比 0-100）
  y: 15,                     // Y坐标（百分比 0-100）
  width: 25,                 // 宽度（百分比 0-100）
  height: 30,                // 高度（百分比 0-100）
  label: '热区名称',          // 标签文本（显示在热区中间）
  title: '热区标题',          // 标题（label的备用字段）
  data: {},                  // 自定义数据对象
  disabled: false,           // 是否禁用（禁用后不可交互）
  visible: true,             // 是否可见
  draggable: true,           // 是否可拖拽移动
  resizable: true,           // 是否可调整大小
  style: {}                  // 自定义样式对象
}
theme
类型: Object

默认值: {}

说明: 主题配色配置

javascript
{
  // 绘制中虚线框
  drawingLineColor: '#4f6ef7',
  drawingLineWidth: 2,
  drawingFillColor: 'rgba(79, 110, 247, 0.15)',
  
  // 热区默认状态
  zoneBorderColor: '#4f6ef7',
  zoneBorderWidth: 2,
  zoneFillColor: 'rgba(79, 110, 247, 0.2)',
  zoneBorderStyle: 'solid',
  zoneOpacity: 1,
  
  // 热区激活状态
  zoneActiveBorderColor: '#e53e3e',
  zoneActiveFillColor: 'rgba(229, 62, 62, 0.15)',
  zoneActiveBorderStyle: 'solid',
  zoneActiveShadow: '0 0 0 2px rgba(229, 62, 62, 0.3)',
  
  // 热区悬停状态
  zoneHoverBorderColor: '#718096',
  zoneHoverFillColor: 'rgba(113, 128, 150, 0.2)',
  
  // 手柄样式
  handleSize: 10,
  handleColor: '#ffffff',
  handleBorderColor: '#4f6ef7',
  handleBorderWidth: 2,
  handleActiveBorderColor: '#e53e3e',
  handleBorderRadius: '3px',
  handleShadow: '0 1px 4px rgba(0,0,0,0.15)',
  
  // 标签样式
  labelColor: '#333333',
  labelFontSize: '12px',
  labelFontWeight: '600',
  labelBackgroundColor: 'transparent',
  labelPadding: '2px 4px',
  labelMaxWidth: '90%',
  
  // 过渡动画
  transitionDuration: '0s',
  transitionTiming: 'ease'
}
config
类型: Object

默认值: {}

说明: 功能配置

javascript
{
  minSize: 2,              // 最小热区尺寸（百分比）
  maxZones: 20,            // 最大热区数量
  showLabel: true,         // 是否显示标签
  enableResize: true,      // 是否允许调整大小
  enableMove: true,        // 是否允许移动
  enableDraw: true,        // 是否允许绘制新热区
  enableDelete: true,      // 是否允许键盘删除
  showHandles: true,       // 是否显示拖拽手柄
  allowOverlap: true,      // 是否允许热区重叠
  snapToGrid: false,       // 是否吸附到网格
  gridSize: 5,             // 网格大小（百分比）
  useAnimationFrame: true, // 使用RAF优化性能
  debounceUpdate: true     // 防抖更新
}
事件列表
事件名	参数	说明
zone-created	zone	热区创建
zone-updated	zone	热区更新
zone-deleted	zone	热区删除
zone-click	zone	点击热区
zone-focus	zone	热区获得焦点
zone-hover	zone	鼠标进入热区
zone-leave	zone	鼠标离开热区
draw-start	{x, y}	开始绘制
drawing	{x, y, width, height}	绘制中
draw-end	{x, y, width, height, valid}	绘制结束
drag-start	{zone, handle, type}	开始拖拽
moving	{zone, originalZone}	移动中
resizing	{zone, handle, originalZone}	调整大小中
drag-end	{zone, type}	拖拽结束
max-reached	max	达到最大数量
selection-cleared	-	清除选择
all-cleared	-	清除所有热区
zones-imported	count	导入完成
resize	{width, height}	容器尺寸变化
公共方法
通过 ref 调用组件方法：

vue
<script setup>
import { ref } from 'vue'

const hotzoneRef = ref(null)

// 所有方法都通过 hotzoneRef.value 调用
const doSomething = () => {
  hotzoneRef.value?.addZone({...})
}
</script>
添加热区
javascript
// 添加单个热区
hotzoneRef.value.addZone({
  x: 20, y: 20, width: 30, height: 30,
  label: '新热区',
  data: { type: 'custom' }
})

// 批量添加
hotzoneRef.value.addZones([
  { x: 10, y: 10, width: 20, height: 20, label: '热区1' },
  { x: 40, y: 40, width: 25, height: 25, label: '热区2' }
])
更新热区
javascript
hotzoneRef.value.updateZone('zone_id', {
  label: '新名称',
  x: 30, y: 30,
  data: { updated: true }
})
删除热区
javascript
// 删除指定热区
hotzoneRef.value.removeZone('zone_id')

// 清除所有
hotzoneRef.value.clearAll()
获取热区
javascript
// 获取激活的热区
const zone = hotzoneRef.value.getActiveZone()

// 获取指定热区
const zone = hotzoneRef.value.getZone('zone_id')

// 获取所有热区
const zones = hotzoneRef.value.getAllZones()
设置激活热区
javascript
hotzoneRef.value.setActiveZone('zone_id')
hotzoneRef.value.setActiveZone(null)  // 取消选择
控制热区状态
javascript
// 禁用/启用
hotzoneRef.value.disableZone('zone_id')
hotzoneRef.value.enableZone('zone_id')

// 隐藏/显示
hotzoneRef.value.hideZone('zone_id')
hotzoneRef.value.showZone('zone_id')
数据导入导出
javascript
// 导出
const data = hotzoneRef.value.exportZones()
console.log(JSON.stringify(data, null, 2))

// 导入
hotzoneRef.value.importZones(data)
获取容器尺寸
javascript
const size = hotzoneRef.value.getSize()
console.log(size.width, size.height)
完整示例（Vue3 Composition API）
vue
<template>
  <div class="demo">
    <h2>图片热区编辑器</h2>
    
    <div class="toolbar">
      <button @click="addHotzone">添加热区</button>
      <button @click="addMultipleHotzones">批量添加</button>
      <button @click="exportData">导出数据</button>
      <button @click="importData">导入数据</button>
      <button @click="clearAll">清除全部</button>
    </div>
    
    <!-- 热区组件 -->
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
    
    <!-- 热区列表 -->
    <div class="zone-list" v-if="zones.length > 0">
      <h3>热区列表 ({{ zones.length }})</h3>
      <div v-for="zone in zones" :key="zone.id" class="zone-item">
        <span>{{ zone.label }}</span>
        <span>({{ zone.x.toFixed(1) }}%, {{ zone.y.toFixed(1) }}%)</span>
        <button @click="hotzoneRef?.setActiveZone(zone.id)">选择</button>
        <button @click="hotzoneRef?.removeZone(zone.id)">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageHotzone from 'vue3-image-hotzone'

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
    x: 40, y: 40, width: 20, height: 20,
    label: `热区-${Date.now() % 1000}`,
    data: { created: new Date().toISOString() }
  })
}

const addMultipleHotzones = () => {
  hotzoneRef.value?.addZones([
    { x: 10, y: 10, width: 20, height: 20, label: '区域A' },
    { x: 40, y: 40, width: 20, height: 20, label: '区域B' },
    { x: 70, y: 60, width: 15, height: 20, label: '区域C' }
  ])
}

const exportData = () => {
  const data = hotzoneRef.value?.exportZones()
  if (data) {
    const json = JSON.stringify(data, null, 2)
    console.log(json)
    navigator.clipboard?.writeText(json)
  }
}

const importData = () => {
  const json = prompt('请粘贴热区数据（JSON格式）:')
  if (json) {
    try {
      const data = JSON.parse(json)
      hotzoneRef.value?.importZones(data)
    } catch (e) {
      alert('JSON解析失败')
    }
  }
}

const clearAll = () => {
  if (confirm('确定清除所有热区？')) {
    hotzoneRef.value?.clearAll()
  }
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
}

.zone-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f7fafc;
  border-radius: 6px;
  margin-bottom: 8px;
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
}

.zone-item button:hover {
  background: #e2e8f0;
}
</style>
预设主题
javascript
// 默认蓝色
const defaultTheme = {}

// 暗色主题
const darkTheme = {
  zoneBorderColor: '#718096',
  zoneFillColor: 'rgba(113, 128, 150, 0.2)',
  zoneActiveBorderColor: '#fbd38d',
  zoneActiveFillColor: 'rgba(251, 211, 141, 0.15)',
  labelColor: '#e2e8f0'
}

// 绿色主题
const greenTheme = {
  zoneBorderColor: '#38a169',
  zoneFillColor: 'rgba(56, 161, 105, 0.2)',
  zoneActiveBorderColor: '#f56565',
  zoneActiveFillColor: 'rgba(245, 101, 101, 0.15)'
}

// 海洋主题（圆形手柄）
const oceanTheme = {
  zoneBorderColor: '#0077b6',
  zoneFillColor: 'rgba(0, 119, 182, 0.2)',
  zoneActiveBorderColor: '#ff6b6b',
  handleBorderRadius: '50%',
  handleSize: 12
}
键盘快捷键
快捷键	说明
Delete / Backspace	删除当前激活的热区
Escape	取消当前选择 / 取消绘制
TypeScript 支持
如需 TypeScript 支持，可以添加类型声明文件：

typescript
// vue3-image-hotzone.d.ts
declare module 'vue3-image-hotzone' {
  import { DefineComponent } from 'vue'
  
  interface Zone {
    id?: string
    x: number
    y: number
    width: number
    height: number
    label?: string
    title?: string
    data?: Record<string, any>
    disabled?: boolean
    visible?: boolean
    draggable?: boolean
    resizable?: boolean
    style?: Record<string, any>
  }
  
  interface Theme {
    drawingLineColor?: string
    zoneBorderColor?: string
    zoneFillColor?: string
    zoneActiveBorderColor?: string
    zoneActiveFillColor?: string
    handleSize?: number
    [key: string]: any
  }
  
  interface Config {
    minSize?: number
    maxZones?: number
    showLabel?: boolean
    enableResize?: boolean
    enableMove?: boolean
    enableDraw?: boolean
    [key: string]: any
  }
  
  const ImageHotzone: DefineComponent<{
    src: string
    zones?: Zone[]
    theme?: Theme
    config?: Config
    onZoneCreated?: (zone: Zone) => void
    onZoneUpdated?: (zone: Zone) => void
    onZoneDeleted?: (zone: Zone) => void
    [key: string]: any
  }>
  
  export default ImageHotzone
}
```
浏览器兼容性
Chrome 60+

Firefox 60+

Safari 12+

Edge 79+

iOS Safari 12+

Android Chrome 60+

License
MIT