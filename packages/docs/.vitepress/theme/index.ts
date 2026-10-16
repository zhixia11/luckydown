import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import Luckydown from 'luckydown'
import { type App } from 'vue'
import 'luckydown/luckydown.css'

export default {
  Layout,
  enhanceApp({ app }: { app: App }) {
    app.use(Luckydown)
  },
} satisfies Theme
