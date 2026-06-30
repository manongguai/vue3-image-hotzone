import ImageHotzone from './components/ImageHotzone.vue'

ImageHotzone.install = function(app) {
  app.component(ImageHotzone.name, ImageHotzone)
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.createApp().use(ImageHotzone)
}

export default ImageHotzone