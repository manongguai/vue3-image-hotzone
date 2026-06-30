/**
 * 生成唯一ID
 * @returns {string}
 */
export function generateId() {
  return 'zone_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * 标准化热区数据
 * @param {Object} zone
 * @returns {Object}
 */
export function normalizeZone(zone) {
  return {
    id: zone.id || generateId(),
    x: Number(zone.x) || 0,
    y: Number(zone.y) || 0,
    width: Number(zone.width) || 0,
    height: Number(zone.height) || 0,
    label: zone.label || zone.title || '',
    title: zone.title || zone.label || '',
    data: zone.data || {},
    style: zone.style || {},
    disabled: zone.disabled || false,
    visible: zone.visible !== false,
    draggable: zone.draggable !== false,
    resizable: zone.resizable !== false
  }
}

/**
 * 清理热区数据
 * @param {Object} zone
 * @returns {Object}
 */
export function cleanZoneData(zone) {
  return {
    id: zone.id,
    x: Number(zone.x.toFixed(2)),
    y: Number(zone.y.toFixed(2)),
    width: Number(zone.width.toFixed(2)),
    height: Number(zone.height.toFixed(2)),
    label: zone.label,
    title: zone.title,
    data: zone.data,
    disabled: zone.disabled,
    visible: zone.visible,
    draggable: zone.draggable,
    resizable: zone.resizable,
    style: zone.style
  }
}

/**
 * 像素转百分比
 * @param {number} px
 * @param {number} containerSize
 * @param {boolean} snapToGrid
 * @param {number} gridSize
 * @returns {number}
 */
export function pxToPercent(px, containerSize, snapToGrid = false, gridSize = 5) {
  if (containerSize === 0) return 0
  let percent = (px / containerSize) * 100
  if (snapToGrid) {
    percent = Math.round(percent / gridSize) * gridSize
  }
  return percent
}

/**
 * 获取鼠标/触摸位置
 * @param {Event} e
 * @param {HTMLElement} container
 * @returns {{x: number, y: number}}
 */
export function getMousePos(e, container) {
  if (!container) return { x: 0, y: 0 }
  const rect = container.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

/**
 * 限制数值范围
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max))
}

/**
 * 合并默认配置
 * @param {Object} defaultConfig
 * @param {Object} userConfig
 * @returns {Object}
 */
export function mergeConfig(defaultConfig, userConfig = {}) {
  return { ...defaultConfig, ...userConfig }
}