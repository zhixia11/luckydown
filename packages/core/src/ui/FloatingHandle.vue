<template>
  <div class="lucky-floating-container" :class="{ 'is-visible': visible }" :style="{ top: `${top}px` }"
    contenteditable="false">
    <Dropdown :classes="{ root: 'lucky-floating-menu' }" transitionName="none" :trigger="['click']" :menu="{
      selectedKeys: selectedKeys,
      items: menuItems
    }" @open-change="onOpenChange" @menu-click="onMenuClick">
      <Button size="small" color="purple" variant="text" @click.prevent="onHandleClick">
        <template #icon>
          <GripVertical :size="16" />
        </template>
      </Button>
      <template #labelRender="item">
        <span v-if="item?.key === 'align'" @click.stop>
          <div class="lucky-floating-menu-subtitle">
            对齐方式
          </div>
          <div class="lucky-floating-menu-btn-group">
            <Button size="small" color="default" :variant="state?.textAlign == 'left' ? 'filled' : 'text'"
              @click="onTextAlignChange(['align', 'left'])">
              <template #icon>
                <TextAlignStart :size="14" />
              </template>
            </Button>
            <Button size="small" color="default" :variant="state?.textAlign == 'center' ? 'filled' : 'text'"
              @click="onTextAlignChange(['align', 'center'])">
              <template #icon>
                <TextAlignCenter :size="14" />
              </template>
            </Button>
            <Button size="small" color="default" :variant="state?.textAlign == 'right' ? 'filled' : 'text'"
              @click="onTextAlignChange(['align', 'right'])">
              <template #icon>
                <TextAlignEnd :size="14" />
              </template>
            </Button>
            <Button size="small" color="default" :variant="state?.textAlign == 'justify' ? 'filled' : 'text'"
              @click="onTextAlignChange(['align', 'justify'])">
              <template #icon>
                <TextAlignJustify :size="14" />
              </template>
            </Button>
          </div>
        </span>
        <span v-else-if="item?.key === 'indent'" @click.stop>
          <div class="lucky-floating-menu-subtitle">
            缩进
          </div>
          <div class="lucky-floating-menu-btn-group">
            <Button size="small" color="default" variant="text" @click="onIndentChange(['indent', 'out'])">
              <template #icon>
                <ListIndentDecrease :size="14" />
              </template>
            </Button>
            <Button size="small" color="default" variant="text" @click="onIndentChange(['indent', 'in'])">
              <template #icon>
                <ListIndentIncrease :size="14" />
              </template>
            </Button>
          </div>
        </span>
        <span v-else-if="item?.key === 'color'" @click.stop>
          <ColorPicker @change="onColorChange" style="cursor: auto;" />
        </span>
        <template v-else>
          {{ item?.label }}
        </template>
      </template>
    </Dropdown>
  </div>
</template>
<script setup lang="ts">
import { shallowRef, ref, h } from 'vue'
import { Editor } from '@tiptap/vue-3'
import { Dropdown, Button } from 'antdv-next'
import ColorPicker from '@/components/ColorPicker'
import type { ItemType } from 'antdv-next/dist/menu/interface'
import { GripVertical, Plus, Trash, Repeat2, BrushCleaning, Palette, TextAlignStart, TextAlignCenter, TextAlignEnd, TextAlignJustify, ListIndentDecrease, ListIndentIncrease } from 'lucide-vue-next'
import { TEXT_BLOCK_TYPE, BLOCK_TYPE_OPTIONS, getBlockState, changeBlockStyle, type BlockState } from '../core/block'

const props = defineProps({
  editor: {
    type: Editor,
    required: true,
  }
})
const visible = shallowRef(false)
const open = shallowRef(false)
const top = shallowRef(0)
const currentBlockDOM = shallowRef<HTMLElement | null>(null)
const currentBlockStartPosition = shallowRef(0)

const menuItems = ref<ItemType[]>([])
const state = ref<BlockState | null>(null)
const selectedKeys = ref<Array<string>>([])


const onOpenChange = (open: boolean) => {
  state.value = getBlockState(props.editor)
  if (!state.value) {
    return
  }
  const menus: ItemType[] = [
    {
      key: 'convert',
      label: '转换为',
      icon: () => h(Repeat2, { size: 16 }),
      children: BLOCK_TYPE_OPTIONS,
    },
    {
      key: 'insert',
      label: '在下方插入',
      icon: () => h(Plus, { size: 16 }),
    }
  ]
  if (TEXT_BLOCK_TYPE.includes(state.value.nodeType)) {
    menus.push({ type: 'divider' })
    menus.push({
      key: 'color_highlight', label: '颜色和高亮', icon: () => h(Palette, { size: 16 }), children: [
        { key: 'color', disabled: true }
      ]
    })
    menus.push({ key: 'indent' })
    menus.push({ key: 'align' })
    menus.push({ type: 'divider' })
    menus.push({
      key: 'clear',
      label: '清除格式',
      icon: () => h(BrushCleaning, { size: 16 })
    })
  }
  menus.push({ type: 'divider' })
  menus.push({
    key: 'delete',
    label: '删除区块',
    danger: true,
    icon: () => h(Trash, { size: 16 }),
  })
  menuItems.value = menus
  // 高亮
  selectedKeys.value = [state.value.nodeType]
}

const onMenuClick = (item: any) => {
  changeBlockStyle(item.keyPath, props.editor)
  state.value = getBlockState(props.editor)
}

const onColorChange = (type: string, value: string) => {
  changeBlockStyle([type, value], props.editor)
  state.value = getBlockState(props.editor)
}

const onTextAlignChange = (keys: Array<string>) => {
  changeBlockStyle(keys, props.editor)
  state.value = getBlockState(props.editor)

}

const onIndentChange = (keys: Array<string>) => {
  changeBlockStyle(keys, props.editor)
  state.value = getBlockState(props.editor)
}


const onHandleClick = () => {
  // 激活官方高亮类名
  props.editor.commands.setNodeSelection(currentBlockStartPosition.value - 1)
}

const triggerMouseMove = (event: MouseEvent, containerDOM: HTMLElement) => {
  const view = props.editor.view
  if (!view) {
    return
  }
  const targetDOM = event.target as HTMLElement
  // 是当前DOM
  if (targetDOM.closest('.lucky-floating-container')) {
    visible.value = true
    return
  }
  // 根据区块定位
  if (view.dom.contains(targetDOM) && targetDOM !== view.dom) {
    const actualBlock = targetDOM.closest('.tiptap > *')
    if (actualBlock) {
      const pos = view.posAtDOM(targetDOM, 0)
      const $pos = view.state.doc.resolve(pos)
      currentBlockStartPosition.value = $pos.start(1)
      const topBlockDOM = view.nodeDOM(currentBlockStartPosition.value - 1) as HTMLElement
      if (!topBlockDOM) {
        return
      }
      currentBlockDOM.value = topBlockDOM
      const coords = view.coordsAtPos(currentBlockStartPosition.value)
      const sandboxRect = containerDOM.getBoundingClientRect()
      top.value = coords.top - sandboxRect.top + containerDOM.scrollTop - 2
      visible.value = true
    }
  }
}

const triggerMouseLeave = () => {
  visible.value = false
  open.value = false
}

defineExpose({
  triggerMouseMove,
  triggerMouseLeave
})
</script>

<style>
.lucky-floating-container {
  position: absolute;
  left: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 100;
  height: 24px;
  width: 24px;
  background: transparent;
  box-sizing: border-box;
  pointer-events: auto;
  opacity: 0;
  transition: all .2s ease-out;
}

.lucky-floating-container.is-visible {
  opacity: 1;
}

.lucky-floating-menu .ant-dropdown-menu-submenu-title {
  display: flex;
  align-items: center;
}

.lucky-floating-menu .ant-dropdown-menu-submenu-selected {
  .ant-dropdown-menu-submenu-title {
    color: var(--ant-color-text) !important;
  }
}

.lucky-floating-menu-subtitle {
  font-size: 12px;
  margin-bottom: 4px;
}

.lucky-floating-menu-btn-group {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  max-width: 168px;
  gap: 4px;
}

.lucky-floating-menu-popover {
  z-index: 1080 !important;
}
</style>