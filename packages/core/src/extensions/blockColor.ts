import { Extension } from '@tiptap/core'

export interface BlockColorOptions {
  types: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockColor: {
      // 设置块级文本颜色
      setFontColor: (color: string | null) => ReturnType
      // 设置块级背景颜色
      sethighlight: (highlight: string | null) => ReturnType
    }
  }
}

export const BlockColor = Extension.create<BlockColorOptions>({
  name: 'blockColor',
  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          color: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.color || null,
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes.color) {
                return {}
              }
              return { style: `color: ${attributes.color}` }
            },
          },
          highlight: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes.highlight) {
                return {}
              }
              return { style: `background-color: ${attributes.highlight}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontColor:
        (color) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          tr = tr.setSelection(selection)
          let changed = false
          state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, color })
              changed = true
            }
          })
          if (changed && dispatch) {
            dispatch(tr)
          }
          return changed
        },
      sethighlight:
        (highlight) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          tr = tr.setSelection(selection)
          let changed = false
          state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, highlight })
              changed = true
            }
          })
          if (changed && dispatch) {
            dispatch(tr)
          }
          return changed
        },
    }
  },
})
