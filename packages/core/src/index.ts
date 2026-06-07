import { type App } from 'vue'
import Luckydown from './Luckydown.vue'

// 支持全局引入 app.use(Luckydown)
export default {
  install(app: App) {
    app.component('Luckydown', Luckydown)
  }
}

// 支持按需引入 import { Luckydown } from 'luckydown'
export { Luckydown }