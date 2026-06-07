type OutputFormat = 'html' | 'json'

export interface LuckydownProps {
  format?: OutputFormat
  readonly?: boolean
  placeholder?: string
}

export const STANDARD_EMPTY_JSON = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}
