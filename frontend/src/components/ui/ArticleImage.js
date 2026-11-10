import Image from '@tiptap/extension-image'
import { imageAlignment, imageStyle, imageWidth } from '../../utils/articleFormatting.js'

export const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: '100%', parseHTML: (element) => imageWidth(element.getAttribute('width') || '100%') },
      alignment: { default: 'center', parseHTML: (element) => imageAlignment(element.getAttribute('data-align')) },
    }
  },
  renderHTML({ node }) {
    const { src, alt, title, width, alignment } = node.attrs
    return ['img', { src, alt, title, width: imageWidth(width), 'data-align': imageAlignment(alignment), style: imageStyle(width, alignment), loading: 'lazy', decoding: 'async' }]
  },
})
