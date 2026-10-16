import Image from '@tiptap/extension-image'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { Plugin } from '@tiptap/pm/state'
import ImageBlock from '../components/image/ImageBlock.vue'

export const ImageExt = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: (element) => element.style.width || element.getAttribute('width') || '100%',
        renderHTML: (attributes) => {
          return {
            width: attributes.width,
            style: `width: ${attributes.width}`,
          }
        },
      },
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => {
          return {
            'data-align': attributes.align,
          }
        },
      },
      caption: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-caption') || '',
        renderHTML: (attributes) => {
          return {
            'data-caption': attributes.caption,
          }
        },
      },
      showCaption: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-show-caption') === 'true',
        renderHTML: (attributes) => {
          return {
            'data-show-caption': attributes.showCaption ? 'true' : 'false',
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (el) => {
          const img = (el as HTMLElement).querySelector('img')
          if (!img) return false
          const captionEl = (el as HTMLElement).querySelector('figcaption')
          const caption = captionEl?.textContent || ''
          const showCaptionAttr = (el as HTMLElement).getAttribute('data-show-caption')
          const showCaption = showCaptionAttr ? showCaptionAttr === 'true' : !!captionEl
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.style.width || img.getAttribute('width') || '100%',
            align: (el as HTMLElement).style.textAlign || (el as HTMLElement).getAttribute('data-align') || 'center',
            caption,
            showCaption,
          }
        },
      },
      {
        tag: 'img[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const showCaption = HTMLAttributes.showCaption === 'true' || HTMLAttributes.showCaption === true
    return [
      'figure',
      {
        class: 'luckydown-image-figure',
        'data-align': HTMLAttributes.align || 'center',
        'data-show-caption': showCaption ? 'true' : 'false',
        style: `text-align: ${HTMLAttributes.align || 'center'}; width: 100%; margin: 12px 0;`,
      },
      [
        'img',
        {
          src: HTMLAttributes.src,
          alt: HTMLAttributes.alt,
          title: HTMLAttributes.title,
          style: `width: ${HTMLAttributes.width || '100%'}; display: inline-block;`,
        },
      ],
      showCaption && HTMLAttributes.caption
        ? [
            'figcaption',
            {
              class: 'luckydown-image-caption',
              style: 'color: #8c8c8c; font-size: 0.85rem; font-style: italic; margin-top: 8px; text-align: center;',
            },
            HTMLAttributes.caption,
          ]
        : '',
    ]
  },

  addNodeView() {
    return VueNodeViewRenderer(ImageBlock)
  },

  addProseMirrorPlugins() {
    /**
     * Helper: read a File as base64 DataURL, then measure its naturalWidth.
     * Inserts the image node with pixel-based width if smaller than container,
     * or '100%' if the image is wider.
     */
    const insertImageFromFile = (view: any, file: File, pos?: number) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        const img = new window.Image()
        img.onload = () => {
          const editorWidth = view.dom.clientWidth
          const naturalWidth = img.naturalWidth
          const width = naturalWidth >= editorWidth ? '100%' : `${naturalWidth}px`

          const imageNode = view.state.schema.nodes.image
          if (imageNode) {
            const node = imageNode.create({ src: base64, width })
            if (pos !== undefined) {
              const transaction = view.state.tr.insert(pos, node)
              view.dispatch(transaction)
            } else {
              const transaction = view.state.tr.replaceSelectionWith(node)
              view.dispatch(transaction)
            }
          }
        }
        img.src = base64
      }
      reader.readAsDataURL(file)
    }

    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            paste: (view, event) => {
              const items = event.clipboardData?.items
              if (!items) return false

              for (let i = 0; i < items.length; i++) {
                const item = items[i]
                if (item && item.type.indexOf('image') === 0) {
                  event.preventDefault()
                  const file = item.getAsFile()
                  if (file) {
                    insertImageFromFile(view, file)
                  }
                  return true
                }
              }
              return false
            },
            drop: (view, event) => {
              const files = event.dataTransfer?.files
              if (!files) return false

              for (let i = 0; i < files.length; i++) {
                const file = files[i]
                if (file && file.type.indexOf('image') === 0) {
                  event.preventDefault()
                  const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
                  insertImageFromFile(view, file, coordinates?.pos)
                  return true
                }
              }
              return false
            },
          },
        },
      }),
    ]
  },
})
