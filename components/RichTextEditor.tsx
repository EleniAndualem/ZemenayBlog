"use client"

import React, { useState, useRef, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  Link, 
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code,
  Strikethrough,
  Pilcrow
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

interface ToolbarButtonProps {
  icon: React.ReactNode
  onClick: () => void
  isActive?: boolean
  title: string
  disabled?: boolean
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, onClick, isActive, title, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
      isActive 
        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
        : 'text-gray-600 dark:text-gray-400'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    title={title}
  >
    {icon}
  </button>
)

export default function RichTextEditor({ value, onChange, placeholder, className = "" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const savedRangeRef = useRef<Range | null>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  // Add custom placeholder logic
  useEffect(() => {
    if (editorRef.current && !value && placeholder) {
      editorRef.current.innerHTML = `<span class="text-gray-400 dark:text-gray-500 italic">${placeholder}</span>`
    }
  }, [value, placeholder])

  const saveSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range
    }
  }

  const restoreSelection = () => {
    if (!editorRef.current) return
    editorRef.current.focus()
    const selection = window.getSelection()
    if (!selection) return
    selection.removeAllRanges()
    if (savedRangeRef.current) {
      selection.addRange(savedRangeRef.current)
    }
  }

  const execCommand = (command: string, value?: string) => {
    restoreSelection()
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    updateContent()
  }

  const updateContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      // Normalize list styling for better bullets/numbering
      const root = editorRef.current
      const uls = Array.from(root.querySelectorAll('ul'))
      const ols = Array.from(root.querySelectorAll('ol'))
      uls.forEach((ul) => {
        if (!ul.className.includes('list-')) {
          ul.classList.add('list-disc', 'ml-5', 'my-2')
        }
      })
      ols.forEach((ol) => {
        if (!ol.className.includes('list-')) {
          ol.classList.add('list-decimal', 'ml-5', 'my-2')
        }
      })
      // Remove placeholder styling if user starts typing
      if (content.includes('text-gray-400 dark:text-gray-500 italic')) {
        onChange(content.replace(/<span class="text-gray-400 dark:text-gray-500 italic">.*?<\/span>/, ''))
      } else {
        onChange(content)
      }
    }
  }

  const insertHeading = (level: number) => {
    restoreSelection()
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const heading = document.createElement(`h${level}`)
      heading.className = `text-${level === 1 ? '3xl' : level === 2 ? '2xl' : 'xl'} font-bold mb-4 mt-6`
      heading.textContent = selection.toString() || `Heading ${level}`
      
      if (selection.toString()) {
        range.deleteContents()
      }
      range.insertNode(heading)
      updateContent()
    }
  }

  const insertList = (ordered: boolean) => {
    execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList')
  }

  const insertQuote = () => {
    restoreSelection()
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const blockquote = document.createElement('blockquote')
      blockquote.className = 'border-l-4 border-blue-500 pl-4 py-2 my-4 italic text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-r'
      blockquote.textContent = selection.toString() || 'Quote text here'
      
      if (selection.toString()) {
        range.deleteContents()
      }
      range.insertNode(blockquote)
      updateContent()
    }
  }

  const insertCode = () => {
    restoreSelection()
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const code = document.createElement('code')
      code.className = 'bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-sm'
      code.textContent = selection.toString() || 'Code here'
      
      if (selection.toString()) {
        range.deleteContents()
      }
      range.insertNode(code)
      updateContent()
    }
  }

  const insertLink = () => {
    if (linkUrl && linkText) {
      restoreSelection()
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const link = document.createElement('a')
        link.href = linkUrl
        link.textContent = linkText
        link.className = 'text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300'
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        
        range.deleteContents()
        range.insertNode(link)
        updateContent()
      }
      setShowLinkInput(false)
      setLinkUrl("")
      setLinkText("")
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    updateContent()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      document.execCommand('insertParagraph', false)
      updateContent()
    }
  }

  const handleFocus = () => {
    if (!editorRef.current) return
    const content = editorRef.current.innerHTML
    if (content.includes('text-gray-400 dark:text-gray-500 italic')) {
      editorRef.current.innerHTML = ''
      onChange('')
    }
  }

  const setParagraph = () => {
    restoreSelection()
    // format current block to paragraph (normal text)
    document.execCommand('formatBlock', false, 'P')
    updateContent()
  }

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={<Pilcrow className="w-4 h-4" />}
            onClick={setParagraph}
            title="Normal Text"
          />
          <ToolbarButton
            icon={<Bold className="w-4 h-4" />}
            onClick={() => execCommand('bold')}
            title="Bold (Ctrl+B)"
          />
          <ToolbarButton
            icon={<Italic className="w-4 h-4" />}
            onClick={() => execCommand('italic')}
            title="Italic (Ctrl+I)"
          />
          <ToolbarButton
            icon={<Underline className="w-4 h-4" />}
            onClick={() => execCommand('underline')}
            title="Underline (Ctrl+U)"
          />
          <ToolbarButton
            icon={<Strikethrough className="w-4 h-4" />}
            onClick={() => execCommand('strikethrough')}
            title="Strikethrough"
          />
        </div>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Headings */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={<Heading1 className="w-4 h-4" />}
            onClick={() => insertHeading(1)}
            title="Heading 1"
          />
          <ToolbarButton
            icon={<Heading2 className="w-4 h-4" />}
            onClick={() => insertHeading(2)}
            title="Heading 2"
          />
          <ToolbarButton
            icon={<Heading3 className="w-4 h-4" />}
            onClick={() => insertHeading(3)}
            title="Heading 3"
          />
        </div>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Lists and Formatting */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={<List className="w-4 h-4" />}
            onClick={() => insertList(false)}
            title="Bullet List"
          />
          <ToolbarButton
            icon={<ListOrdered className="w-4 h-4" />}
            onClick={() => insertList(true)}
            title="Numbered List"
          />
          <ToolbarButton
            icon={<Quote className="w-4 h-4" />}
            onClick={insertQuote}
            title="Quote"
          />
          <ToolbarButton
            icon={<Code className="w-4 h-4" />}
            onClick={insertCode}
            title="Inline Code"
          />
        </div>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Alignment */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={<AlignLeft className="w-4 h-4" />}
            onClick={() => execCommand('justifyLeft')}
            title="Align Left"
          />
          <ToolbarButton
            icon={<AlignCenter className="w-4 h-4" />}
            onClick={() => execCommand('justifyCenter')}
            title="Align Center"
          />
          <ToolbarButton
            icon={<AlignRight className="w-4 h-4" />}
            onClick={() => execCommand('justifyRight')}
            title="Align Right"
          />
          <ToolbarButton
            icon={<AlignJustify className="w-4 h-4" />}
            onClick={() => execCommand('justifyFull')}
            title="Justify"
          />
        </div>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Links */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={<Link className="w-4 h-4" />}
            onClick={() => setShowLinkInput(true)}
            title="Insert Link"
          />
        </div>
      </div>

      {/* Link Input Modal */}
      {showLinkInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Link text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={insertLink}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Insert
                </button>
                <button
                  onClick={() => {
                    setShowLinkInput(false)
                    setLinkUrl("")
                    setLinkText("")
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No image modal */}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[400px] p-6 focus:outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 prose prose-sm max-w-none dark:prose-invert"
        onInput={updateContent}
        onFocus={handleFocus}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onMouseDown={saveSelection}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning
      />
    </div>
  )
}
