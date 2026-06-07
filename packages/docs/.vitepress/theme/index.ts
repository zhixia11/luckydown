import DefaultTheme from 'vitepress/theme'
import Luckydown from 'luckydown'
import { type App } from 'vue'
import 'luckydown/luckydown.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: App }) {
    // 💡 注册为全局组件，这样在任何 .md 文件里都能直接用
    app.use(Luckydown)
  }
}