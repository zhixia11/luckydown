<template>
  <NodeViewWrapper :style="wrapperStyle" class="lucky-image-node-view-wrapper lucky-selectednode-disabled"
    :class="{ 'is-selected': selected }">

    <!-- Upload Placeholder (when no src) -->
    <div v-if="!node.attrs.src" class="lucky-image-upload-placeholder" contenteditable="false"
      @click="triggerFileSelect" @mousedown.prevent>
      <div class="upload-icon-wrapper">
        <ImagePlus :size="32" />
      </div>
      <div class="upload-text">点击上传图片</div>
      <div class="upload-hint">支持 JPG、PNG、GIF、SVG 等格式</div>
    </div>

    <!-- Image display (when src exists) -->
    <template v-else>
      <!-- Toolbar (Only visible when selected and editable) -->
      <!-- <div v-if="selected && editor.isEditable" class="lucky-image-toolbar lucky-bubble-menu-popover"
        contenteditable="false" @mousedown.prevent>
        <Button size="small" :color="node.attrs.align === 'left' ? 'purple' : 'default'" variant="text"
          @click="setAlign('left')" title="左对齐">
          <template #icon>
            <TextAlignStart :size="14" />
          </template>
</Button>
<Button size="small" :color="node.attrs.align === 'center' ? 'purple' : 'default'" variant="text"
  @click="setAlign('center')" title="居中对齐">
  <template #icon>
            <TextAlignCenter :size="14" />
          </template>
</Button>
<Button size="small" :color="node.attrs.align === 'right' ? 'purple' : 'default'" variant="text"
  @click="setAlign('right')" title="右对齐">
  <template #icon>
            <TextAlignEnd :size="14" />
          </template>
</Button>
<Divider orientation="vertical" style="height: 16px; margin: 0 4px;" />
<Button size="small" :color="node.attrs.showCaption ? 'purple' : 'default'" variant="text" @click="toggleCaption"
  title="图片描述备注">
  <template #icon>
            <MessageSquare :size="14" />
          </template>
</Button>
</div> -->

      <!-- Image Container with Resize Handles -->
      <div ref="containerRef" class="lucky-image-container" :class="{ 'is-selected': selected }"
        :style="containerStyle">
        <img :src="node.attrs.src" :alt="node.attrs.alt" :title="node.attrs.title" class="lucky-image-element" />

        <!-- Drag Resize Anchors -->
        <template v-if="selected && editor.isEditable">
          <div class="lucky-image-resize-handle left" @mousedown.prevent.stop="onResizeStart('left', $event)">
            <div class="resize-pill"></div>
          </div>
          <div class="lucky-image-resize-handle right" @mousedown.prevent.stop="onResizeStart('right', $event)">
            <div class="resize-pill"></div>
          </div>
        </template>
      </div>

      <!-- Caption description at the bottom -->
      <div v-if="node.attrs.showCaption" class="lucky-image-caption-container" :style="captionStyle"
        contenteditable="false" @mousedown.stop>
        <input v-if="editor.isEditable" type="text" class="lucky-image-caption-input" :value="node.attrs.caption"
          placeholder="添加图片备注描述..." @input="onCaptionInput" @keydown.stop />
        <div v-else-if="node.attrs.caption" class="lucky-image-caption-text">
          {{ node.attrs.caption }}
        </div>
      </div>
    </template>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { Button, Divider } from 'antdv-next'
import { TextAlignStart, TextAlignCenter, TextAlignEnd, MessageSquare, ImagePlus } from 'lucide-vue-next'

const props = defineProps(nodeViewProps)

const containerRef = ref<HTMLElement | null>(null)

// Wrapper flex direction and alignment based on align attribute
const wrapperStyle = computed(() => {
  // For upload placeholder, always center
  if (!props.node.attrs.src) {
    return {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      width: '100%',
      margin: '12px 0',
      position: 'relative' as const
    }
  }

  let alignment = 'center'
  if (props.node.attrs.align === 'left') alignment = 'flex-start'
  else if (props.node.attrs.align === 'right') alignment = 'flex-end'

  return {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: alignment,
    width: '100%',
    margin: '12px 0',
    position: 'relative' as const
  }
})

// Image container style (width) — supports both percent and pixel values
const containerStyle = computed(() => {
  return {
    width: props.node.attrs.width || '100%',
    maxWidth: '100%',
    position: 'relative' as const
  }
})

// Caption style constrained to the width of the image itself
const captionStyle = computed(() => {
  return {
    width: props.node.attrs.width || '100%',
    maxWidth: '100%',
    textAlign: 'center' as const
  }
})

const setAlign = (align: 'left' | 'center' | 'right') => {
  props.updateAttributes({ align })
}

const toggleCaption = () => {
  props.updateAttributes({ showCaption: !props.node.attrs.showCaption })
}

const onCaptionInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  props.updateAttributes({ caption: target.value })
}

// File selection for upload placeholder
const triggerFileSelect = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const files = (e.target as HTMLInputElement).files
    if (files && files.length > 0) {
      const file = files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result as string
          // Measure natural width to decide the display width
          const img = new window.Image()
          img.onload = () => {
            const editorEl = props.editor.view.dom
            const editorWidth = editorEl.clientWidth
            const naturalWidth = img.naturalWidth
            const width = naturalWidth >= editorWidth ? '100%' : `${naturalWidth}px`
            props.updateAttributes({ src: base64, width })
          }
          img.src = base64
        }
        reader.readAsDataURL(file)
      }
    }
  }
  input.click()
}

// Optimized drag resizing handler (uses direct DOM manipulation for butter-smooth resizing)
const onResizeStart = (direction: 'left' | 'right', event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()

  const startX = event.clientX
  const container = containerRef.value
  if (!container) return

  const startWidth = container.getBoundingClientRect().width
  const parent = container.parentElement
  if (!parent) return
  const parentWidth = parent.getBoundingClientRect().width

  let finalWidthPercent = parseFloat(props.node.attrs.width || '100')
  if (isNaN(finalWidthPercent)) {
    finalWidthPercent = 100
  }

  const onMouseMove = (moveEvent: MouseEvent) => {
    const dx = moveEvent.clientX - startX
    let newWidth = startWidth
    if (direction === 'right') {
      newWidth = startWidth + dx
    } else {
      newWidth = startWidth - dx
    }

    let widthPercent = (newWidth / parentWidth) * 100
    widthPercent = Math.max(15, Math.min(100, widthPercent)) // Limit between 15% and 100%
    finalWidthPercent = Math.round(widthPercent)

    // Update width directly in DOM for 60fps rendering performance
    container.style.width = `${finalWidthPercent}%`
  }

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)

    // Save final width back to Prosemirror attributes exactly once
    props.updateAttributes({
      width: `${finalWidthPercent}%`
    })
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}
</script>

<style>
.lucky-image-node-view-wrapper {
  transition: all 0.3s ease;
}

.lucky-image-node-view-wrapper.is-selected {
  z-index: 100;
}

/* Upload Placeholder Styles */
.lucky-image-upload-placeholder {
  width: 100%;
  max-width: 480px;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.25s ease;
  padding: 24px 16px;
  user-select: none;
}

.lucky-image-upload-placeholder:hover {
  border-color: #722ed1;
  background: #faf5ff;
}

.upload-icon-wrapper {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f0e6ff;
  color: #722ed1;
  transition: all 0.25s ease;
}

.lucky-image-upload-placeholder:hover .upload-icon-wrapper {
  background: #e6d6ff;
  transform: scale(1.06);
}

.upload-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: #595959;
}

.upload-hint {
  font-size: 0.8rem;
  color: #bfbfbf;
}

/* Image Container Styles */
.lucky-image-container {
  display: inline-block;
  border-radius: 6px;
  overflow: visible;
  transition: box-shadow 0.16s ease-out, border-color 0.16s ease-out;
  border: 2px solid transparent;
  box-sizing: border-box;
}

.lucky-image-container.is-selected {
  border-color: #722ed1;
  box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.2);
}

.lucky-image-element {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 4px;
  user-select: none;
  -webkit-user-drag: none;
}

/* Resize Handles */
.lucky-image-resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lucky-image-resize-handle.left {
  left: -6px;
  cursor: ew-resize;
}

.lucky-image-resize-handle.right {
  right: -6px;
  cursor: ew-resize;
}

.resize-pill {
  width: 6px;
  height: 36px;
  background-color: #722ed1;
  border: 1.5px solid #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  opacity: 0.8;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.lucky-image-resize-handle:hover .resize-pill {
  opacity: 1;
  transform: scaleX(1.2);
}

/* Toolbar Styles */
.lucky-image-toolbar {
  position: absolute;
  top: -46px;
}

/* Caption Styles */
.lucky-image-caption-container {
  margin-top: 8px;
  box-sizing: border-box;
}

.lucky-image-caption-input {
  font-size: 0.85rem;
  color: #595959;
  outline: none;
  border: none;
  border-bottom: 1px dashed transparent;
  background: transparent;
  width: 100%;
  text-align: center;
  padding: 4px 8px;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  box-sizing: border-box;
}

.lucky-image-caption-input:hover {
  border-bottom-color: #d9d9d9;
}

.lucky-image-caption-input:focus {
  border-bottom-color: #722ed1;
  border-bottom-style: solid;
  background-color: #faf5ff;
  border-radius: 2px;
}

.lucky-image-caption-text {
  font-size: 0.85rem;
  color: #8c8c8c;
  padding: 4px 8px;
  font-style: italic;
  text-align: center;
}

.lucky-selectednode-disabled {
  background-color: transparent !important;
}
</style>
