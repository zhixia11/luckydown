import { h } from 'vue'
import { Type, List, ListOrdered, ListTodo, Quote, Code, Heading1, Heading2, Heading3, Table, SeparatorHorizontal, Image } from 'lucide-vue-next'
import { Editor } from '@tiptap/vue-3'
import { Fragment, Schema, Node } from '@tiptap/pm/model'
import type { ItemType } from 'antdv-next/dist/menu/interface'
export type Level = 1 | 2 | 3 | 4 | 5 | 6

/** 区块类型选项 */
export const BLOCK_TYPE_OPTIONS: ItemType[] = [
  {
    key: 'paragraph',
    label: '文本',
    icon: () => h(Type, { size: 16 }),
  },
  {
    key: 'h1',
    label: '标题1',
    icon: () => h(Heading1, { size: 16 }),
  },
  {
    key: 'h2',
    label: '标题2',
    icon: () => h(Heading2, { size: 16 }),
  },
  {
    key: 'h3',
    label: '标题3',
    icon: () => h(Heading3, { size: 16 }),
  },
  {
    key: 'bulletList',
    label: '无序列表',
    icon: () => h(List, { size: 16 }),
  },
  {
    key: 'orderedList',
    label: '有序列表',
    icon: () => h(ListOrdered, { size: 16 }),
  },
  {
    key: 'taskList',
    label: '任务列表',
    icon: () => h(ListTodo, { size: 16 }),
  },
  {
    key: 'blockquote',
    label: '引用',
    icon: () => h(Quote, { size: 16 }),
  },
  {
    key: 'codeBlock',
    label: '代码块',
    icon: () => h(Code, { size: 16 }),
  },
]

/**插入类型选项 */
export const INSERT_TYPE_OPTIONS: ItemType[] = [
  {
    key: 'table',
    label: '表格',
    icon: () => h(Table, { size: 16 }),
  },
  {
    key: 'separator',
    label: '分割线',
    icon: () => h(SeparatorHorizontal, { size: 16 }),
  },
  {
    key: 'image',
    label: '图片',
    icon: () => h(Image, { size: 16 }),
  },
]

/** 区块类型转换映射逻辑 */
type BlockConverterFn = (schema: Schema, contents: Node[], attrs?: Record<string, any>) => Node

const BLOCK_CONVERTERS: Record<string, BlockConverterFn> = {
  paragraph: (schema, contents) => schema.nodes.paragraph!.create(null, contents),
  heading: (schema, contents, attrs) => schema.nodes.heading!.create(attrs, contents),
  bulletList: (schema, contents) => createListBlock(schema, contents, 'bulletList'),
  orderedList: (schema, contents) => createListBlock(schema, contents, 'orderedList'),
  taskList: (schema, contents) => createListBlock(schema, contents, 'taskList'),
  blockquote: (schema, contents) => schema.nodes.blockquote!.create(null, schema.nodes.paragraph!.create(null, contents)),
  codeBlock: (schema, contents) => {
    const fragment = Fragment.from(contents)
    const text = fragment.textBetween(0, fragment.size, '\n')
    return schema.nodes.codeBlock!.create(null, text ? schema.text(text) : undefined)
  },
}

/**
 * 创建列表区块
 * @param schema
 * @param contents
 * @param listType
 * @returns
 */
const createListBlock = (schema: Schema, contents: Node[], listType: string) => {
  const isTaskList = listType === 'taskList'
  const itemType = isTaskList ? 'taskItem' : 'listItem'
  // 列表的每一项是一个 listItem/taskItem，里面包含一个装有全部文本碎片的 paragraph
  const items = schema.nodes[itemType]!.create(isTaskList ? { checked: false } : null, schema.nodes.paragraph!.create(null, contents))
  return schema.nodes[listType]!.create(null, items)
}

/**
 * 提取节点的子内容
 * @param {Node} node - 节点
 * @returns {Node[]} 节点的内容
 */
const extractContents = (node: Node): Node[] => {
  const contents: Node[] = []
  switch (node.type.name) {
    case 'bulletList':
    case 'orderedList':
    case 'taskList':
      node.forEach((item) => {
        const paragraph = item.firstChild
        if (paragraph) {
          paragraph.content.forEach((childNode) => {
            contents.push(childNode)
          })
        }
      })
      break
    case 'blockquote':
      node.forEach((child) => {
        contents.push(child)
      })
      break
    default:
      node.content.forEach((childNode) => {
        contents.push(childNode)
      })
      break
  }
  return contents
}

/**
 * 改变区块样式
 * 调用前必须先选中整个区块
 * @param type
 * @param editor
 * @returns
 */
export const convertBlockType = (type: string, editor: Editor) => {
  const { state, view } = editor
  const { selection }: { selection: any } = state
  const node = selection.node as any
  let current = node.type.name
  if (current == 'heading') {
    current = 'h' + node.attrs.level
  }
  if (type == current) {
    return
  }
  let converter
  let attrs
  // 处理heading
  if (['h1', 'h2', 'h3'].includes(type)) {
    converter = BLOCK_CONVERTERS['heading']
    attrs = {
      level: parseInt(type.replace('h', '')) as Level,
    }
  } else {
    converter = BLOCK_CONVERTERS[type]
    attrs = {}
  }
  if (!converter) {
    return
  }
  const { schema }: { schema: Schema } = editor.state
  const contents = extractContents(node)
  const newNode = converter(schema, contents, attrs)
  view.dispatch(state.tr.replaceWith(selection.from, selection.to, newNode))
}

/**
 * 在光标处插入一个新区块
 * @param keys
 * @param editor
 * @returns
 */
export const insertNewBlock = (keys: string[], editor: Editor) => {
  const type = keys[0]
  switch (type) {
    case 'paragraph':
      editor.chain().focus().setParagraph().run()
      break
    case 'h1':
    case 'h2':
    case 'h3':
      const level = parseInt(type.replace('h', '')) as Level
      editor.chain().focus().toggleHeading({ level: level }).run()
      break
    case 'bulletList':
      editor.chain().focus().toggleBulletList().run()
      break
    case 'orderedList':
      editor.chain().focus().toggleOrderedList().run()
      break
    case 'taskList':
      editor.chain().focus().toggleTaskList().run()
      break
    case 'blockquote':
      editor.chain().focus().toggleBlockquote().run()
      break
    case 'codeBlock':
      editor.chain().focus().toggleCodeBlock().run()
      break
    case 'horizontalRule':
      editor.chain().focus().setHorizontalRule().run()
      break
    case 'image':
      window.dispatchEvent(new CustomEvent('trigger-slash-image-upload'))
      break
    case 'table':
      break
  }
}

/**
 * 改变区块样式
 * @param keys 参数
 * @param editor 编辑器实例
 * @returns
 */
export const changeBlockStyle = (keys: string | Array<string>, editor: Editor) => {
  const type = keys[0]
  if (type == 'convert') {
    convertBlockType(keys[1] as string, editor)
  } else if (type == 'insert') {
    const { selection }: { selection: any } = editor.state
    let position = selection.from + selection.node.nodeSize
    editor
      .chain()
      .insertContentAt(position, { type: 'paragraph' })
      .focus(position + 1)
      .insertContent('/')
      .run()
  } else if (type == 'clear') {
    const { selection } = editor.state
    editor.chain().focus().unsetAllMarks().clearNodes().setNodeSelection(selection.from).run()
  } else if (type == 'color') {
    const { selection } = editor.state
    const from = selection.from
    const color = keys[1] as string
    editor.chain().focus().setFontColor(color).setNodeSelection(from).run()
  } else if (type == 'highlight') {
    const { selection } = editor.state
    const from = selection.from
    const color = keys[1] as string
    editor.chain().focus().setBackgroundColor(color).setNodeSelection(from).run()
  } else if (type == 'align') {
    const { selection } = editor.state
    const alignment = keys[1] as string
    editor.chain().focus().setTextAlign(alignment).setNodeSelection(selection.from).run()
  } else if (type == 'indent') {
    const { selection } = editor.state
    const direction = keys[1]
    if (direction === 'in') {
      editor.chain().focus().indent().setNodeSelection(selection.from).run()
    } else {
      editor.chain().focus().outdent().setNodeSelection(selection.from).run()
    }
  } else if (type == 'delete') {
    const { selection } = editor.state
    editor.chain().focus().deleteRange({ from: selection.from, to: selection.to }).run()
  }
}

export interface BlockState {
  nodeType: string
  attrs: Record<string, any>
  color?: string
  highlight?: string
  textAlign?: string
  indent?: number
}

export const TEXT_BLOCK_TYPE = ['heading', 'paragraph']

/**
 * 获取当前选中的区块状态
 * 比如背景颜色、字体颜色、加粗、缩进、对齐等
 * 为应对高亮需求，heading会返回具体的大小，例如h1、h2
 *
 * @param editor
 * @returns
 */
export const getBlockState = (editor: Editor): BlockState | null => {
  const { state } = editor
  const { selection }: { selection: any } = state
  const node = selection.node
  if (!node) {
    return null
  }
  let nodeType = node.type.name
  if (nodeType == 'heading') {
    nodeType = 'h' + node.attrs.level
  }
  return {
    nodeType,
    attrs: node.attrs,
    color: node.attrs.color,
    highlight: node.attrs.highlight,
    textAlign: node.attrs.textAlign,
    indent: node.attrs.indent || 0,
  } as BlockState
}
