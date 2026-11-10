import { imageAlignment, imageWidth } from '../../utils/articleFormatting.js'

// Editor-only controls. Saved/public articles still contain a plain <img>.
export function createArticleImageView({ node, editor, getPos }) {
  let currentNode = node
  let resizing = null
  const dom = document.createElement('div')
  dom.className = 'article-image-node'
  dom.contentEditable = 'false'
  const image = document.createElement('img')
  image.draggable = false
  dom.append(image)
  const handles = []
  const canEdit = () => Boolean(editor.options.editable && !editor.isDestroyed)

  const position = () => {
    if (editor.isDestroyed) return undefined
    try { return getPos() } catch { return undefined }
  }
  const select = () => {
    const pos = position()
    if (pos !== undefined) editor.commands.setNodeSelection(pos)
  }
  const maximumWidth = () => {
    const parent = dom.parentElement
    if (!parent) return 1200
    const style = getComputedStyle(parent)
    return Math.max(1, Math.min(1200, parent.clientWidth - parseFloat(style.paddingLeft || 0) - parseFloat(style.paddingRight || 0)))
  }
  const constrain = (width) => Math.round(Math.max(Math.min(80, maximumWidth()), Math.min(maximumWidth(), width)))
  const sync = () => {
    const attrs = currentNode.attrs
    const alignment = imageAlignment(attrs.alignment)
    dom.style.width = imageWidth(attrs.width)
    dom.style.marginLeft = alignment === 'left' ? '0' : 'auto'
    dom.style.marginRight = alignment === 'right' ? '0' : 'auto'
    dom.dataset.align = alignment
    for (const [key, value] of Object.entries({ src: attrs.src, alt: attrs.alt || '', title: attrs.title, width: imageWidth(attrs.width) })) {
      if (value == null) image.removeAttribute(key)
      else if (image.getAttribute(key) !== String(value)) image.setAttribute(key, value)
    }
    image.dataset.align = alignment
    for (const handle of handles) handle.disabled = !canEdit()
  }
  const commit = (width) => {
    const pos = position()
    if (pos === undefined || !canEdit()) return
    editor.chain().setNodeSelection(pos).updateAttributes('image', { width: `${constrain(width)}px` }).run()
  }
  const removeListeners = () => {
    document.removeEventListener('pointermove', move)
    document.removeEventListener('pointerup', finish)
    document.removeEventListener('pointercancel', cancel)
    window.removeEventListener('blur', cancel)
  }
  const complete = (save) => {
    if (!resizing) return
    const width = dom.getBoundingClientRect().width
    const active = resizing
    resizing = null
    removeListeners()
    if (active.handle?.hasPointerCapture?.(active.pointerId)) active.handle.releasePointerCapture(active.pointerId)
    dom.classList.remove('is-resizing')
    if (save) commit(width)
    sync()
  }
  const move = (event) => {
    if (!resizing || event.pointerId !== resizing.pointerId) return
    if (event.cancelable) event.preventDefault()
    const delta = (event.clientX - resizing.startX) * (resizing.direction.includes('left') ? -1 : 1)
    dom.style.width = `${constrain(resizing.startWidth + delta)}px`
  }
  const finish = (event) => { if (resizing && event.pointerId === resizing.pointerId) complete(true) }
  const cancel = () => complete(false)
  const begin = (event, direction) => {
    if (!canEdit() || event.button > 0 || resizing) return
    event.preventDefault()
    event.stopPropagation()
    select()
    resizing = { pointerId: event.pointerId, direction, startX: event.clientX, startWidth: dom.getBoundingClientRect().width, handle: event.currentTarget }
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* Synthetic or already-cancelled pointer. */ }
    dom.classList.add('is-resizing')
    document.addEventListener('pointermove', move, { passive: false })
    document.addEventListener('pointerup', finish)
    document.addEventListener('pointercancel', cancel)
    window.addEventListener('blur', cancel)
  }
  for (const [direction, label] of [['top-left', 'بالا چپ'], ['top-right', 'بالا راست'], ['bottom-left', 'پایین چپ'], ['bottom-right', 'پایین راست']]) {
    const handle = document.createElement('button')
    handle.type = 'button'
    handle.className = 'article-image-resize-handle'
    handle.dataset.imageResizeHandle = direction
    handle.setAttribute('aria-label', `تغییر اندازه تصویر از گوشه ${label}`)
    handle.title = 'برای تغییر اندازه بکشید؛ یا از کلیدهای جهت چپ و راست استفاده کنید'
    handle.addEventListener('pointerdown', (event) => begin(event, direction))
    handle.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', '+', '-', '=', 'Escape'].includes(event.key)) return
      event.preventDefault()
      event.stopPropagation()
      if (event.key === 'Escape') { cancel(); editor.commands.focus(); return }
      const increase = ['ArrowRight', '+', '='].includes(event.key)
      commit(dom.getBoundingClientRect().width + (increase ? 1 : -1) * (event.shiftKey ? 25 : 10))
    })
    dom.append(handle)
    handles.push(handle)
  }
  image.addEventListener('click', select)
  const editableChanged = () => {
    if (!canEdit()) cancel()
    for (const handle of handles) handle.disabled = !canEdit()
  }
  editor.on('update', editableChanged)
  sync()
  return {
    dom,
    update(updatedNode) {
      if (updatedNode.type !== currentNode.type) return false
      currentNode = updatedNode
      if (!resizing) sync()
      return true
    },
    selectNode() { dom.classList.add('is-selected', 'ProseMirror-selectednode') },
    deselectNode() { dom.classList.remove('is-selected', 'ProseMirror-selectednode') },
    stopEvent(event) { return Boolean(event.target?.closest?.('[data-image-resize-handle]')) },
    ignoreMutation(mutation) { return mutation.type !== 'selection' },
    destroy() {
      resizing = null
      removeListeners()
      editor.off('update', editableChanged)
      image.removeEventListener('click', select)
    },
  }
}
