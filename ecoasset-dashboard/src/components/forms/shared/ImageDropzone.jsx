import React, { useRef, useState } from 'react'

export default function ImageDropzone({ value, onChange, label, hint }) {
  const inputRef = useRef(null)
  const [dragover, setDragover] = useState(false)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onChange({ file, preview: e.target.result })
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {!value ? (
        <div
          className={`dropzone ${dragover ? 'dragover' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragover(true) }}
          onDragLeave={() => setDragover(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragover(false)
            handleFile(e.dataTransfer.files[0])
          }}
        >
          <div className="dropzone-icon">📁</div>
          <div className="dropzone-title">{label}</div>
          <div className="dropzone-subtitle">{hint || 'Glissez ou cliquez pour parcourir'}</div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div
          className="dropzone-preview"
          style={{ backgroundImage: `url(${value.preview})` }}
        >
          <button
            className="dropzone-preview-remove"
            onClick={() => onChange(null)}
            type="button"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
