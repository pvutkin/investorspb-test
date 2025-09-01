import React from 'react'
import { 
  Bold, Italic, Underline, List, ListOrdered,
  Link, Quote, Code, Image, Video
} from 'lucide-react'

const RichTextEditor = ({ value, onChange, placeholder = 'Введите текст...' }) => {
  const handleFormat = (format) => {
    const textarea = document.getElementById('editor')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let newValue = value
    let newSelectionStart = start
    let newSelectionEnd = end

    switch (format) {
      case 'bold':
        newValue = value.substring(0, start) + `**${selectedText}**` + value.substring(end)
        newSelectionStart = start + 2
        newSelectionEnd = end + 2
        break
      case 'italic':
        newValue = value.substring(0, start) + `_${selectedText}_` + value.substring(end)
        newSelectionStart = start + 1
        newSelectionEnd = end + 1
        break
      case 'underline':
        newValue = value.substring(0, start) + `<u>${selectedText}</u>` + value.substring(end)
        newSelectionStart = start + 3
        newSelectionEnd = end + 3
        break
      case 'link':
        const url = prompt('Введите URL:')
        if (url) {
          newValue = value.substring(0, start) + `[${selectedText}](${url})` + value.substring(end)
          newSelectionStart = start + selectedText.length + 3 + url.length
          newSelectionEnd = newSelectionStart
        }
        break
      case 'quote':
        newValue = value.substring(0, start) + `> ${selectedText}\n` + value.substring(end)
        newSelectionStart = start + 2
        newSelectionEnd = end + 2
        break
      case 'code':
        newValue = value.substring(0, start) + '```\n' + selectedText + '\n```' + value.substring(end)
        newSelectionStart = start + 4
        newSelectionEnd = end + 4
        break
      default:
        return
    }

    onChange(newValue)
    
    // Restore selection
    setTimeout(() => {
      textarea.setSelectionRange(newSelectionStart, newSelectionEnd)
      textarea.focus()
    }, 0)
  }

  const toolbarButtons = [
    { icon: Bold, format: 'bold', title: 'Жирный' },
    { icon: Italic, format: 'italic', title: 'Курсив' },
    { icon: Underline, format: 'underline', title: 'Подчеркнутый' },
    { icon: List, format: 'list', title: 'Маркированный список' },
    { icon: ListOrdered, format: 'ordered-list', title: 'Нумерованный список' },
    { icon: Link, format: 'link', title: 'Ссылка' },
    { icon: Quote, format: 'quote', title: 'Цитата' },
    { icon: Code, format: 'code', title: 'Код' },
    { icon: Image, format: 'image', title: 'Изображение' },
    { icon: Video, format: 'video', title: 'Видео' }
  ]

  return (
    <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        {toolbarButtons.map((button) => {
          const Icon = button.icon
          return (
            <button
              key={button.format}
              type="button"
              onClick={() => handleFormat(button.format)}
              title={button.title}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            >
              <Icon className="w-4 h-4" />
            </button>
          )
        })}
      </div>

      {/* Editor */}
      <textarea
        id="editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={10}
        className="w-full px-4 py-3 border-0 rounded-b-lg focus:ring-0 resize-none"
      />

      {/* Help Text */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <p className="text-xs text-gray-500">
          Поддерживается Markdown-разметка
        </p>
      </div>
    </div>
  )
}

export default RichTextEditor