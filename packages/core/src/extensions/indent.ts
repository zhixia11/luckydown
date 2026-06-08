import { Extension } from '@tiptap/core'

export interface IndentOptions {
  types: string[]
  minLevel: number
  maxLevel: number
  indentSize: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      // 增加缩进
      indent: () => ReturnType
      // 减少缩进
      outdent: () => ReturnType
    }
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: 'indent',
  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      minLevel: 0,
      maxLevel: 8,
      indentSize: 24,
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element: HTMLElement) => {
              const paddingLeft = element.style.paddingLeft || ''
              const match = paddingLeft.match(/^(\d+)px$/)
              return match ? Math.round(parseInt(match[1] as string, 10) / this.options.indentSize) : 0
            },
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes.indent) {
                return {}
              }
              return {
                style: `padding-left: ${attributes.indent * this.options.indentSize}px`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      indent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          tr = tr.setSelection(selection)
          let changed = false
          state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const currentIndent = (node.attrs.indent as number) || 0
              if (currentIndent < this.options.maxLevel) {
                const indent = currentIndent + 1
                tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent })
                changed = true
              }
            }
          })
          if (changed && dispatch) {
            dispatch(tr)
          }
          return changed
        },
      outdent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          tr = tr.setSelection(selection)
          let changed = false
          state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const currentIndent = (node.attrs.indent as number) || 0
              if (currentIndent > this.options.minLevel) {
                const indent = currentIndent - 1
                tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent })
                changed = true
              }
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
