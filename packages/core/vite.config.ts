import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      cleanVueFileName: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    cssCodeSplit: false,
    sourcemap: true,
    minify: false,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'Luckydown',
      formats: ['es', 'umd'],
      fileName: (format) => `luckydown.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', /^antdv-next/, /^lucide-vue-next/, /^@tiptap\//],
      output: {
        globals: (id) => {
          if (id === 'vue') return 'Vue'
          if (id.startsWith('antdv-next')) return 'AntDVNext'
          if (id.startsWith('lucide-vue-next')) return 'LucideVueNext'
          if (id.startsWith('@tiptap/vue-3')) return 'TiptapVue3'
          if (id.startsWith('@tiptap/pm')) return 'TiptapPm'
          if (id.startsWith('@tiptap/')) {
            // 将 @tiptap/extension-color 转换为 TiptapExtensionColor
            const name = id
              .replace('@tiptap/', '')
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join('')
            return `Tiptap${name}`
          }
          return id
        },
      },
    },
  },
})
