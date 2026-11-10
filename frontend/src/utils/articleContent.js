import DOMPurify from 'dompurify'

const tags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a', 'pre', 'code', 'hr', 'sub', 'sup']
const attributes = ['href', 'title', 'dir', 'start']
const richPattern = /<\/?(?:html|body|div|p|span|h[1-6]|strong|b|em|i|u|s|ul|ol|li|blockquote|br|a|pre|code)\b/i
const digits = (value) => value.replace(/[۰-۹٠-٩]/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.includes(digit) ? '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit) : '٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
const bullet = /^\s*(?:[•●◦▪▫◆◇‣⁃\uf076\uf0b7]|[-*]|o(?=\s))\s+/
const numbered = /^\s*([0-9۰-۹٠-٩]+)[.)]\s+/

function plainTextHTML(text) {
  const wrapper = document.createElement('div')
  let list = null
  for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
    if (!line.trim()) { list = null; continue }
    const number = line.match(numbered)
    const marker = line.match(bullet)
    if (number || marker) {
      const type = number ? 'ol' : 'ul'
      if (!list || list.localName !== type) {
        list = document.createElement(type)
        if (number) list.setAttribute('start', String(Number(digits(number[1]))))
        wrapper.append(list)
      }
      const item = document.createElement('li')
      item.textContent = line.slice((number || marker)[0].length)
      list.append(item)
    } else {
      list = null
      const paragraph = document.createElement('p')
      paragraph.textContent = line
      wrapper.append(paragraph)
    }
  }
  return wrapper.innerHTML
}

// Word often stores list labels in spans and list levels in paragraph styles,
// rather than actual ul/ol nodes. Convert them before dropping Office styling.
function convertWordLists(root) {
  for (const parent of [root, ...root.querySelectorAll('div')]) {
    let stack = []
    for (const paragraph of [...parent.children]) {
      const style = paragraph.getAttribute('style') || ''
      const match = style.match(/mso-list:\s*(\w+)\s+level(\d+)\s+(\w+)/i)
      if (!match || paragraph.closest('li')) { stack = []; continue }
      const labels = [...paragraph.querySelectorAll('span')].filter((span) => /mso-list:\s*ignore/i.test(span.getAttribute('style') || ''))
      const label = labels.map((span) => span.textContent).join('') || paragraph.textContent
      const number = label.trim().match(/^([0-9۰-۹٠-٩]+)[.)]/)
      const type = number ? 'ol' : 'ul'
      labels.forEach((span) => span.remove())
      if (!labels.length) {
        const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT)
        const first = walker.nextNode()
        if (first) first.textContent = first.textContent.replace(numbered, '').replace(bullet, '')
      }
      const level = Number(match[2])
      const id = `${match[1]}-${match[3]}-${type}`
      while (stack.length && (stack.at(-1).level > level || stack.at(-1).level === level && stack.at(-1).id !== id)) stack.pop()
      if (!stack.length || stack.at(-1).level < level) {
        const list = document.createElement(type)
        if (number) list.setAttribute('start', String(Number(digits(number[1]))))
        if (stack.length) stack.at(-1).list.lastElementChild.append(list)
        else parent.insertBefore(list, paragraph)
        stack.push({ level, id, list })
      }
      const item = document.createElement('li')
      item.append(...paragraph.childNodes)
      stack.at(-1).list.append(item)
      paragraph.remove()
    }
  }
}

export function articleHTML(value) {
  const source = String(value || '')
  if (!richPattern.test(source)) return plainTextHTML(source)
  // The intermediate DOM is never inserted into the page. A second strict
  // sanitization removes all styles/classes after extracting semantic marks.
  const root = DOMPurify.sanitize(source, {
    ALLOWED_TAGS: [...tags, 'div', 'span', 'h1', 'h5', 'h6'],
    ALLOWED_ATTR: [...attributes, 'style', 'class'],
    RETURN_DOM: true,
  })
  for (const element of [...root.querySelectorAll('*')]) {
    const style = element.style
    const officeStyle = element.getAttribute('style') || ''
    if (style && (style.fontWeight === 'bold' || Number(style.fontWeight) >= 600 || /mso-bidi-font-weight:\s*bold/i.test(officeStyle)) && !['B', 'STRONG'].includes(element.tagName)) {
      const strong = document.createElement('strong')
      strong.append(...element.childNodes)
      element.append(strong)
    }
    if ((style?.fontStyle === 'italic' || /mso-bidi-font-style:\s*italic/i.test(officeStyle)) && !['I', 'EM'].includes(element.tagName)) {
      const emphasis = document.createElement('em')
      emphasis.append(...element.childNodes)
      element.append(emphasis)
    }
    if (style?.textDecorationLine?.includes('underline')) {
      const underline = document.createElement('u')
      underline.append(...element.childNodes)
      element.append(underline)
    }
  }
  convertWordLists(root)
  for (const paragraph of [...root.querySelectorAll('p')]) {
    const heading = paragraph.className.match(/MsoHeading([1-6])|MsoTitle/i)
    if (heading) {
      const replacement = document.createElement(`h${Math.min(4, Math.max(2, Number(heading[1]) || 2))}`)
      replacement.append(...paragraph.childNodes)
      paragraph.replaceWith(replacement)
    }
  }
  for (const heading of [...root.querySelectorAll('h1,h5,h6')]) {
    const replacement = document.createElement(heading.tagName === 'H1' ? 'h2' : 'h4')
    replacement.append(...heading.childNodes)
    heading.replaceWith(replacement)
  }
  for (const block of [...root.querySelectorAll('div')].reverse()) {
    if ([...block.children].some((child) => /^(P|DIV|UL|OL|H[2-4]|BLOCKQUOTE)$/.test(child.tagName))) block.replaceWith(...block.childNodes)
    else {
      const paragraph = document.createElement('p')
      paragraph.append(...block.childNodes)
      block.replaceWith(paragraph)
    }
  }
  return DOMPurify.sanitize(root.innerHTML, { ALLOWED_TAGS: tags, ALLOWED_ATTR: attributes, ALLOW_DATA_ATTR: false, ALLOW_ARIA_ATTR: false })
}

export function articlePlainText(value) {
  const html = articleHTML(value)
  const container = document.createElement('div')
  container.innerHTML = html.replace(/<\/(?:p|li|h[2-4]|blockquote)>/g, '$& ')
  return container.textContent || ''
}
