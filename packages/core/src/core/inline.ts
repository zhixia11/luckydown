import { Editor } from '@tiptap/vue-3'

export interface SelectionState{
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  code:boolean
  superscript: boolean
  subscript: boolean
  color?: string
  highlight?: string
  link?: string
}

/**
 * 获取选取状态
 * 加粗，下划线，删除线，上标，下标，颜色，高亮，链接等
 * @param {*} editor 
 */
export const getSelectionState = (editor: Editor):SelectionState => {
  const state:SelectionState = {
    bold: editor.isActive('bold') || false,
    italic: editor.isActive('italic') || false,
    underline: editor.isActive('underline') || false,
    strike: editor.isActive('strike') || false,
    code: editor.isActive('code') || false,
    superscript: editor.isActive('superscript') || false,
    subscript: editor.isActive('subscript') || false,
    color: editor.getAttributes('textStyle')?.color,
    highlight: editor.getAttributes('highlight')?.color,
    link: editor.getAttributes('link')?.href || null
  }
  return state
}

/**
 * 修改选中的行内样式
 * 
 * @param keys 
 * @param editor 
 * @returns 
 */
export const changeInlineStyle = (keys: Array<string> | string, editor: Editor) => {
  if (!editor) {
    return
  }
  const type = Array.isArray(keys) ? keys[0] : keys
  if (type === 'bold') {
    editor.chain().focus().toggleBold().run()
  } else if (type === 'italic') {
    editor.chain().focus().toggleItalic().run()
  } else if (type === 'underline') {
    editor.chain().focus().toggleUnderline().run()
  } else if (type === 'strikethrough') {
    editor.chain().focus().toggleStrike().run()
  } else if (type === 'code') {
    editor.chain().focus().toggleCode().run()
  } else if (type === 'superscript') {
    editor.chain().focus().toggleSuperscript().run()
  } else if (type === 'subscript') {
    editor.chain().focus().toggleSubscript().run()
  } else if (type === 'color') {
    editor.chain().focus().setColor(keys[1] as string).run()
  } else if (type === 'highlight') {
    editor.chain().focus().setHighlight({ color: keys[1] as string }).run()
  } else if (type === 'link') {
    const href = keys[1] as string
    if (href) {
      editor.chain().focus().setLink({ href: href }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
  }
}
