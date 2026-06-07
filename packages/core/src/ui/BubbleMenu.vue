<template>
  <BubbleMenu ref="bubbleRef" :options="options" :editor="editor" :should-show="shouldShow"
    class="lucky-bubble-menu-popover" @mousedown.prevent>
    <Button size="small" :color="state?.bold ? 'purple' : 'default'" variant="text" @click="onClick('bold')">
      <template #icon>
        <Bold :size="14" />
      </template>
    </Button>
    <Button size="small" :color="state?.italic ? 'purple' : 'default'" variant="text" @click="onClick('italic')">
      <template #icon>
        <Italic :size="14" />
      </template>
    </Button>
    <Button size="small" :color="state?.underline ? 'purple' : 'default'" variant="text" @click="onClick('underline')">
      <template #icon>
        <Underline :size="14" />
      </template>
    </Button>
    <Button size="small" :color="state?.strike ? 'purple' : 'default'" variant="text" @click="onClick('strikethrough')">
      <template #icon>
        <Strikethrough :size="14" />
      </template>
    </Button>
    <Button size="small" :color="state?.code ? 'purple' : 'default'" variant="text" @click="onClick('code')">
      <template #icon>
        <Code :size="14" />
      </template>
    </Button>
    <Divider orientation="vertical" />
    <Button size="small" :color="state?.superscript ? 'purple' : 'default'" variant="text"
      @click="onClick('superscript')">
      <template #icon>
        <Superscript :size="14" />
      </template>
    </Button>
    <Button size="small" :color="state?.subscript ? 'purple' : 'default'" variant="text" @click="onClick('subscript')">
      <template #icon>
        <Subscript :size="14" />
      </template>
    </Button>
    <Divider orientation="vertical" />
    <Popover placement="bottom" trigger="click" :arrow="false">
      <Button size="small" color="default" variant="text">
        <template #icon>
          <Palette :size="14" :color="state?.color || '#000000'" />
        </template>
      </Button>
      <template #content>
        <ColorPicker @change="onColorChange" />
      </template>
    </Popover>
    <Divider orientation="vertical" />
    <Popover :classes="{ container: 'lucky-bubble-menu-sub-popover' }" trigger="click" placement="bottomRight"
      :arrow="false" v-model:open="linkOpen" @open-change="onLinkOpenChange">
      <Button size="small" :color="state?.link ? 'purple' : 'default'" variant="text">
        <template #icon>
          <Link :size="14" />
        </template>
      </Button>
      <template #content>
        <div class="lucky-link-input-container">
          <Input variant="filled" v-model:value="linkUrl" />
          <Button color="default" variant="text">
            <template #icon>
              <CornerDownLeft :size="14" @click="onSetLink" />
            </template>
          </Button>
          <Button color="default" variant="text">
            <template #icon>
              <Delete :size="14" @click="onUnsetLink" />
            </template>
          </Button>
        </div>
      </template>
    </Popover>
  </BubbleMenu>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { Editor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import { Button, Divider, Popover, Input } from 'antdv-next'
import { Bold, Italic, Underline, Strikethrough, Code, Superscript, Subscript, Link, CornerDownLeft, Delete, Palette } from 'lucide-vue-next'
import ColorPicker from '@/components/ColorPicker'
import { changeInlineStyle, getSelectionState, type SelectionState } from '../core/inline'

const props = defineProps({
  editor: {
    type: Editor,
    required: true
  }
})

const state = ref<SelectionState>()
const options = {
  onShow: () => {
    state.value = getSelectionState(props.editor)
  }
}

const shouldShow = ({ state }: { state: any }) => {
  if (state.selection.node) {
    return false
  }
  return !state.selection.empty
}

const onClick = (keys: string | Array<string>) => {
  changeInlineStyle(keys, props.editor)
  state.value = getSelectionState(props.editor)
}

const onColorChange = (type: string, value: string) => {
  const keys = [type, value]
  changeInlineStyle(keys, props.editor)
  state.value = getSelectionState(props.editor)
}

const linkOpen = ref(false)
const linkUrl = ref<string>('')
const onLinkOpenChange = (open: boolean) => {
  if (open) {
    //给linkUrl赋值
    linkUrl.value = state.value?.link || ''
  } else {
    linkUrl.value = ''
  }
}

const onSetLink = () => {
  if (!linkUrl.value) {
    return
  }
  changeInlineStyle(['link', linkUrl.value], props.editor)
  state.value = getSelectionState(props.editor)
  linkOpen.value = false
}

const onUnsetLink = () => {
  changeInlineStyle(['link', ''], props.editor)
  linkOpen.value = false
  state.value = getSelectionState(props.editor)
}
</script>
<style>
.lucky-bubble-menu-popover {
  padding: .375rem .625rem;
  border-radius: .5rem;
  background-color: #ffffff;
  border: 1px solid #722ed1;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.12),
    0 2px 4px -2px rgba(0, 0, 0, 0.16),
    0 6px 16px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 101;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), top 0.2s, left 0.2s;
  will-change: transform, top, left;
}

.lucky-bubble-menu-popover .ant-divider-vertical {
  margin-inline: 0 !important;
}

.lucky-bubble-menu-sub-popover {
  padding: .25rem .5rem !important;
  margin-top: .25rem;
}

.lucky-link-input-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: .25rem;

  * {
    height: 28px;
  }

  input {
    width: 160px;
  }

  button {
    width: 28px !important;
  }
}
</style>