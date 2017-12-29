import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/closetag'
import 'codemirror/mode/meta'
import codeMirror from 'codemirror/lib/codemirror'

import loadmode from './loadmode'
import languages from './modes'
import 'codemirror/lib/codemirror.css'
import './index.css'

loadmode(codeMirror)
window.CodeMirror = codeMirror

const modes = codeMirror.modeInfo
codeMirror.modeURL = process.env.NODE_ENV !== 'production'
  ? './node_modules/codemirror/mode/%N/%N.js'
  : './codemirror/mode/%N/%N.js'

const getModeFromName = name => {
  let result = null
  const lang = languages.filter(lang => lang.name === name)[0]
  if (lang) {
    const { name, mode, mime } = lang
    const matched = modes.filter(m => {
      if (m.mime) {
        if (Array.isArray(m.mime)) {
          return m.mime.indexOf(mime) > -1 && m.mode === mode
        } else {
          return m.mime === mime && m.mode === mode
        }
      } else if (m.mimes.length > 0 && Array.isArray(m.mimes)) {
        return m.mimes.indexOf(mime) > -1 && m.mode === mode
      } else {
        return false
      }
    })
    if (matched.length && typeof matched[0] === 'object') {
      result = {
        name,
        mode: matched[0]
      }
    }
  }
  return result
}

export const search = text => {
  const matchedLangs = languages.filter(lang => {
    return new RegExp(text, 'i').test(lang.name)
  })

  return matchedLangs
    .map(({ name }) => getModeFromName(name))
    .filter(lang => !!lang)
}

/**
 * set cursor at the end of last line.
 */
export const setCursorAtLastLine = cm => {
  const lastLine = cm.lastLine()
  const lineHandle = cm.getLineHandle(lastLine)

  cm.focus()
  cm.setCursor(lastLine, lineHandle.text.length)
}

// if cursor at firstLine return true
export const isCursorAtFirstLine = cm => {
  const cursor = cm.getCursor()
  const { line, ch, outside } = cursor

  return line === 0 && ch === 0 && outside
}

export const isCursorAtLastLine = cm => {
  const lastLine = cm.lastLine()
  const cursor = cm.getCursor()
  const { line, outside, sticky } = cursor
  return line === lastLine && (outside || !sticky)
}

export const isCursorAtBegin = cm => {
  const cursor = cm.getCursor()
  const { line, ch, hitSide } = cursor
  return line === 0 && ch === 0 && !!hitSide
}

export const onlyHaveOneLine = cm => {
  return cm.lineCount() === 1
}

export const isCursorAtEnd = cm => {
  const lastLine = cm.lastLine()
  const lastLineHandle = cm.getLineHandle(lastLine)
  const cursor = cm.getCursor()
  const { line, ch, hitSide } = cursor

  return line === lastLine && ch === lastLineHandle.text.length && !!hitSide
}

export const setCursorAtFirstLine = cm => {
  cm.focus()
  cm.setCursor(0, 0)
}

export const setMode = (doc, text) => {
  const m = getModeFromName(text)

  if (!m) {
    const errMsg = !text
      ? 'You\'d better provided a language mode when you create code block'
      : `${text} is not a valid language mode!`
    return Promise.reject(errMsg) // eslint-disable-line prefer-promise-reject-errors
  }

  const { mode, mime } = m.mode
  console.log(mode)
  return new Promise(resolve => {
    codeMirror.requireMode(mode, () => {
      doc.setOption('mode', mime || mode)
      codeMirror.autoLoadMode(doc, mode)
      resolve(m)
    })
  })
}

export default codeMirror