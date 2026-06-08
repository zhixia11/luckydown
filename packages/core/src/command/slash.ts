import { Extension } from '@tiptap/vue-3'
import Suggestion from '@tiptap/suggestion'
import { createPopupRenderer } from './createPopupRenderer.tsx'
import { BLOCK_TYPE_OPTIONS, INSERT_TYPE_OPTIONS, insertNewBlock } from '../core/block.ts'
import type { ItemType } from 'antdv-next/dist/menu/interface'

type MenuItem = ItemType & {
  key?: string | number
  label?: string
  type?: 'group' | 'divider'
  children?: ItemType[]
}

// 固定的菜单数据
const sourceMenu: MenuItem[] = [
  {
    key: 'block',
    label: '样式',
    type: 'group',
    children: BLOCK_TYPE_OPTIONS,
  },
  { type: 'divider' },
  {
    key: 'insert',
    label: '插入',
    type: 'group',
    children: INSERT_TYPE_OPTIONS,
  },
]

const SlashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        startOfLine: true,

        // 过滤菜单项
        items: ({ query }: { query: string }): MenuItem[] => {
          if (!query) {
            return sourceMenu
          }
          query = query.toLowerCase()
          const filtered: MenuItem[] = []

          sourceMenu.forEach((item) => {
            if (item && item.type === 'group' && item.children) {
              // 过滤出当前组内匹配的子项
              const matched = item.children.filter((child: any) => {
                const hasKey = child.key?.toString().toLowerCase().includes(query)
                const hasLabel = child.label?.toString().toLowerCase().includes(query)
                return hasKey || hasLabel
              })

              if (matched.length > 0) {
                if (filtered.length > 0) {
                  // 补一个分割线
                  filtered.push({ type: 'divider' })
                }
                filtered.push({
                  ...item,
                  children: matched,
                })
              }
            }
          })
          return filtered
        },

        // 执行选中命令
        command: (props: any) => {
          props.editor.chain().focus().deleteRange(props.range).run()
          const keys = props.props.keyPath as Array<string>
          insertNewBlock(keys, props.editor)
        },

        render: createPopupRenderer(),
      }),
    ]
  },
})

export default SlashCommand
