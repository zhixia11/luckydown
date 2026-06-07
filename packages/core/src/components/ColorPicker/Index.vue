<template>
  <div class="lucky-color-picker" @mousedown.prevent>
    <div class="lucky-color-group">
      <div class="lucky-color-group-title">文本颜色</div>
      <div class="lucky-color-group-content">
        <Space wrap>
          <Tooltip :title="color.label" v-for="(color, index) in COLOR_PRESETS" :key="index">
            <Button size="small" color="default" variant="filled" @click="onColorClick(color.color)">
              <template #icon>
                <ALargeSmall :size="16" :style="{ color: color.color }" />
              </template>
            </Button>
          </Tooltip>
        </Space>
      </div>
    </div>
    <div class="lucky-color-group">
      <div class="lucky-color-group-title">背景高亮</div>
      <div class="lucky-color-group-content">
        <Space wrap>
          <Tooltip :title="color.label" v-for="(color, index) in HIGHTLIGHT_PRESETS" :key="index">
            <Button size="small" color="default" variant="filled" :style="{ backgroundColor: color.color }"
              @click="onHighlightClick(color.color)">
              <template #icon>
                <Paintbrush :size="14" style="color: #323843" />
              </template>
            </Button>
          </Tooltip>
        </Space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Tooltip, Button, Space } from 'antdv-next';
import type { ColorPickerProps } from './index'
import { COLOR_PRESETS, HIGHTLIGHT_PRESETS } from './index';
import { ALargeSmall, Paintbrush } from 'lucide-vue-next'

const props = defineProps<ColorPickerProps>()
const color = defineModel<string>('color', { default: '' })
const highlight = defineModel<string>('highlight', { default: '' })
const emit = defineEmits(['change'])

const onColorClick = (value: string) => {
  color.value = value
  emit('change', 'color', value)
}

const onHighlightClick = (value: string) => {
  highlight.value = value
  emit('change', 'highlight', value)
}
</script>

<style>
.lucky-color-picker-container {
  padding: 0 !important;
}

.lucky-color-picker {
  width: 11.75rem;
  box-sizing: content-box;
}

.lucky-color-group:not(:first-child) {
  margin-top: .75rem;
}

.lucky-color-group-title {
  color: #20232b;
  font-size: .75rem;
  margin-bottom: .25rem;
  font-weight: 500;
}
</style>