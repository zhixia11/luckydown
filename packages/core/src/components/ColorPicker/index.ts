import ColorPicker from './Index.vue'

export interface ColorPickerProps {
  colors?: ColorItem[],
  highlights?: ColorItem[]
}

export interface ColorItem{
  color: string,
  label: string
}

export const COLOR_PRESETS:ColorItem[] = [
  { color: '#f5222d', label: '薄暮' },
  { color: '#eb2f96', label: '法式洋红' },
  { color: '#fa541c', label: '火山' },
  { color: '#fa8c16', label: '日暮' },
  { color: '#faad14', label: '金盏花' },
  { color: '#fadb14', label: '日出' },
  { color: '#eaff8f', label: '青柠' },
  { color: '#52c41a', label: '极光绿' },
  { color: '#13c2c2', label: '明青' },
  { color: '#1677ff', label: '拂晓蓝' },
  { color: '#2f54eb', label: '极客蓝' },
  { color: '#722ed1', label: '酱紫' },
  { color: '#8c8c8c', label: '中性灰' },
  { color: '#ffffff', label: '纯白' },
  { color: '#000000', label: '默认' }
] 

export const HIGHTLIGHT_PRESETS:ColorItem[] = [
  { color: '#ffa39e', label: '薄暮' },
  { color: '#ffadd2', label: '法式洋红' },
  { color: '#ffbb96', label: '火山' },
  { color: '#ffd591', label: '日暮' },
  { color: '#ffe58f', label: '金盏花' },
  { color: '#fffb8f', label: '日出' },
  { color: '#eaff8f', label: '青柠' },
  { color: '#b7eb8f', label: '极光绿' },
  { color: '#87e8de', label: '明青' },
  { color: '#91caff', label: '拂晓蓝' },
  { color: '#adc6ff', label: '极客蓝' },
  { color: '#d3adf7', label: '酱紫' },
  { color: '#f0f0f0', label: '中性灰' },
  { color: '#ffffff', label: '纯白' },
  { color: '#000000', label: '默认' },
]

export default ColorPicker