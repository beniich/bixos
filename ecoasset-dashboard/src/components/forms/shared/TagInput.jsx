import React, { useState } from 'react'

export default function TagInput({ tags, onChange, placeholder, maxTags }) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const value = input.trim()
    if (!value) return
    if (maxTags && tags.length >= maxTags) return
    if (tags.includes(value)) return
    onChange([...tags, value])
    setInput('')
  }

  const removeTag = (i) => {
    onChange(tags.filter((_, idx) => idx !== i))
  }

  return (
    <div className="tag-input-wrapper">
      {tags.map((tag, i) => (
        <span key={i} className="tag">
          {tag}
          <button type="button" className="tag-remove" onClick={() => removeTag(i)}>
            ×
          </button>
        </span>
      ))}
      <input
        className="tag-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag()
          } else if (e.key === 'Backspace' && !input && tags.length) {
            removeTag(tags.length - 1)
          }
        }}
        onBlur={addTag}
        placeholder={placeholder}
      />
    </div>
  )
}
