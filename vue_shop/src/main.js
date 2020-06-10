import Vue from 'vue'
import ZkTable from 'vue-table-with-tree-grid'
import App from './App.vue'
import router from './router/router'
import './plugins/element.js'
//  导入字体图标
import './assets/fonts/iconfont.css'
//  导入全局样式表
import './assets/css/global.css'
// 调用富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 富文本编辑器外部引用样式  三种样式三选一引入即可
import 'quill/dist/quill.snow.css'
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.component('tree-table', ZkTable)
Vue.use(VueQuillEditor)

Vue.filter('dateFormat', function (originValue) {
  const dateType = new Date(originValue)
  const year = dateType.getFullYear()
  const month = (dateType.getMonth() + 1 + '').padStart(2, '0')
  const day = (dateType.getDay() + '').padStart(2, '0')
  const hour = (dateType.getDay() + '').padStart(2, '0')
  const seconds = (dateType.getSeconds() + '').padStart(2, '0')
  const minutes = (dateType.getMinutes() + '').padStart(2, '0')

  return `${year}-${month}-${day}
  ${hour}-${seconds}-${minutes}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
