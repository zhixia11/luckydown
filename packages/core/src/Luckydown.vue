<template>
  <div ref="containerRef" class="luckydown-container" :class="{ 'is-readonly': readonly }" @mousemove="onMouseMove"
    @mouseleave="onMouseLeave">
    <FloatingHandle ref="handleRef" v-if="editor && !readonly" :editor="editor" />
    <BubbleMenu v-if="editor && !readonly" :editor="editor" />
    <div class="luckydown-wrapper">
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, watchEffect, toRaw, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { TextAlign } from '@tiptap/extension-text-align'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Image } from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extension-placeholder'
import FloatingHandle from './ui/FloatingHandle.vue'
import BubbleMenu from './ui/BubbleMenu.vue'
import SlashCommand from './command/slash.ts'
import { STANDARD_EMPTY_JSON, type LuckydownProps } from './types.ts'

const {
  format = 'json',
  readonly = false,
  placeholder = '输入 / 唤醒指令菜单...'
} = defineProps<LuckydownProps>()
const modelValue = defineModel<any>({ default: undefined })
const containerRef = ref<HTMLDivElement | null>(null)
const handleRef = ref<InstanceType<typeof FloatingHandle> | null>(null)

const getInitialContent = () => {
  const rawValue = toRaw(modelValue.value)
  if (format === 'json') {
    if (!rawValue || Object.keys(rawValue).length === 0) {
      return STANDARD_EMPTY_JSON
    }
  }
  return rawValue || ''
}

const getValue = () => {
  if (!editor.value) {
    return null
  }
  return format === 'json' ? editor.value.getJSON() : editor.value.getHTML()
}

const editor = useEditor({
  content: getInitialContent(),
  editable: !readonly,
  extensions: [
    StarterKit.configure({
      link: {
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          class: 'lucky-link'
        },
      },
    }),
    Subscript.configure(),
    Superscript.configure(),
    TextStyle.configure(),
    Color.configure(),
    Highlight.configure({
      multicolor: true,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TaskList.configure(),
    TaskItem.configure({
      nested: true,
    }),
    Image.configure(),
    Placeholder.configure({
      placeholder: readonly ? '' : placeholder
    }),
    SlashCommand
  ],
  onUpdate: ({ editor }) => {
    if (modelValue.value !== undefined) {
      modelValue.value = format === 'json' ? editor.getJSON() : editor.getHTML()
    }
  },
})

watch(() => modelValue.value, (newValue) => {
  if (!editor.value || newValue === undefined) {
    return
  }
  const rawNewValue = toRaw(newValue)
  if (format === 'json') {
    const isEmpty = !rawNewValue || Object.keys(rawNewValue).length === 0 || JSON.stringify(rawNewValue) == JSON.stringify(STANDARD_EMPTY_JSON)
    if (isEmpty && editor.value.isEmpty) {
      return
    }
    const current = JSON.stringify(editor.value.getJSON())
    const json = isEmpty ? JSON.stringify(STANDARD_EMPTY_JSON) : JSON.stringify(rawNewValue)
    if (current === json) {
      return
    }
    editor.value.commands.setContent(isEmpty ? STANDARD_EMPTY_JSON : rawNewValue, {
      emitUpdate: false
    })
  } else {
    // HTML 模式的普通对比与写入
    if (editor.value.getHTML() === rawNewValue) return
    editor.value.commands.setContent(rawNewValue || '', {
      emitUpdate: false
    })
  }
}, { deep: false })

watch(() => readonly, (newVal) => {
  if (editor.value) {
    editor.value.setEditable(!newVal)
  }
}, { immediate: true })

const onMouseMove = (event: MouseEvent) => {
  if (readonly) {
    return
  }
  if (handleRef.value && containerRef.value) {
    handleRef.value.triggerMouseMove(event, containerRef.value)
  }
}

const onMouseLeave = () => {
  if (readonly) {
    return
  }
  if (handleRef.value) {
    handleRef.value.triggerMouseLeave()
  }
}

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

defineExpose({
  getValue: getValue
})
</script>
<style>
.luckydown-container {
  width: 100%;
  height: 100%;
  position: relative;
  padding-left: 2.25rem;
  border-radius: .675rem;
  background-color: #ffffff;
  box-sizing: border-box;
}

.luckydown-container .tiptap {
  outline: none;
  color: #20232b;
  font-size: .875rem;
  line-height: 1.5;
}

.luckydown-container h1,
.luckydown-container h2,
.luckydown-container h3 {
  color: #1a1a1a;
  font-weight: 600;
  margin-top: 1.6rem;
  margin-bottom: 0.6rem;
  line-height: 1.35;
  border-radius: .25rem;
}

.luckydown-container h1 {
  font-size: 1.85rem;
}

.luckydown-container h2 {
  font-size: 1.45rem;
}

.luckydown-container h3 {
  font-size: 1.2rem;
}

.luckydown-container p {
  margin-bottom: 0.5rem;
  border-radius: .25rem;
}

.luckydown-container blockquote {
  border-left: 4px solid #722ed1;
  background-color: #efdbff;
  padding: 8px 16px;
  margin: 1rem 0;
  border-radius: 0 8px 8px 0;
  color: #595959;
  font-style: italic;
}

.luckydown-container pre {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 12px 16px;
  margin: 1rem 0;
  white-space: pre-wrap;
  word-break: break-all;
  width: 100%;
  box-sizing: border-box;
}

.luckydown-container pre code {
  background: transparent !important;
  color: #24292e !important;
  padding: 0 !important;
  border-radius: 0 !important;
  border: none !important;
  font-family: Consolas, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  font-size: 0.9em;
  white-space: pre-wrap;
}

.luckydown-container :not(pre)>code {
  background: #fff0f6;
  color: #eb2f96;
  border: 1px solid #ffd8e6;
  border-radius: 4px;
  padding: .2em .4em;
  font-family: Consolas, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  font-size: 0.9em;
  word-break: break-word;
}

.luckydown-container ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.luckydown-container ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.luckydown-container li {
  margin: 0.25rem 0;
}

/*支持多层嵌套列表的圆点变化 */
.luckydown-container ul ul {
  list-style-type: circle;
}

.luckydown-container ul ul ul {
  list-style-type: square;
}

.luckydown-container ul[data-type="taskList"] {
  list-style: none;
  padding-left: 0.5rem;
}

.luckydown-container ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

/* 美化任务列表的复选框（Checkbox） */
.luckydown-container ul[data-type="taskList"] input[type="checkbox"] {
  appearance: none;
  background-color: #fff;
  margin: 0.3rem 0 0 0;
  font: inherit;
  color: #722ed1;
  width: 1.1em;
  height: 1.1em;
  border: 2px solid #722ed1;
  border-radius: 4px;
  display: grid;
  place-content: center;
  cursor: pointer;
  transition: all 0.1s ease;
}

/* 复选框选中的勾勾图形 */
.tiptap ul[data-type="taskList"] input[type="checkbox"]::before {
  content: "";
  width: 0.6em;
  height: 0.6em;
  transform: scale(0);
  transform-origin: center;
  transition: 120ms transform ease-in-out;
  background-color: #fff;
  clip-path: polygon(14% 44%, 0 65%, 40% 100%, 100% 16%, 86% 0%, 40% 68%);
}

/* 复选框选中状态 */
.tiptap ul[data-type="taskList"] input[type="checkbox"]:checked {
  background-color: #722ed1;
}

.tiptap ul[data-type="taskList"] input[type="checkbox"]:checked::before {
  transform: scale(1);
}

/* 任务完成后，让后面的文本变灰色并加删除线 */
.tiptap ul[data-type="taskList"] li[data-checked="true"]>div {
  color: #bfbfbf;
  text-decoration: line-through;
}

.luckydown-container p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.luckydown-container .ProseMirror-selectednode {
  border-radius: .5rem;
  background-color: #efdbff9f;
}

.lucky-link {
  color: #722ed1;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
  font-weight: 500;
  word-break: break-all;
  transition: color 0.25s ease;
  padding-left: 14px;
  position: relative;
}

.lucky-link:hover,
.lucky-link:focus {
  color: #9254de;
}

.lucky-link:active {
  color: #531dab;
}

.lucky-link::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #722ed1;
  box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.2);
  transition: all 0.25s ease;
}

.lucky-link:hover::before {
  background-color: #9254de;
  box-shadow: 0 0 0 4px rgba(146, 84, 222, 0.3);
}

.luckydown-container .ProseMirror-selectednode {
  border-radius: .5rem;
  background-color: #efdbff9f;
}
</style>