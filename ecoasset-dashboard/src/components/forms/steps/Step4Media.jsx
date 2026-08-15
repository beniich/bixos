import React from 'react'
import FormField from '../shared/FormField'
import ImageDropzone from '../shared/ImageDropzone'

export default function Step4Media({ data, update }) {
  const set = (field) => (value) => update({ ...data, [field]: value })

  const handleGallery = (files) => {
    const readers = Array.from(files).map(file => new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve({ file, preview: e.target.result })
      reader.readAsDataURL(file)
    }))
    Promise.all(readers).then(results => {
      set('gallery')([...(data.gallery || []), ...results])
    })
  }

  const removeGalleryItem = (i) => set('gallery')((data.gallery || []).filter((_, idx) => idx !== i))

  return (
    <div>
      <div className="step-header">
        <h2 className="step-title">🖼️ Médias & Communication</h2>
        <p className="step-subtitle">Images et vidéo pour mettre en valeur l'événement</p>
      </div>

      <div className="form-grid">
        <div className="form-grid-full">
          <FormField label="Image principale" required hint="Format 16:9 recommandé, max 5MB">
            <ImageDropzone value={data.coverImage} onChange={set('coverImage')}
              label="Télécharger l'affiche officielle"
              hint="Cette image sera la vitrine de votre événement" />
          </FormField>
        </div>

        <div className="form-grid-full">
          <FormField label="Galerie d'images" hint="Ajoutez jusqu'à 8 images">
            <div className="dropzone" onClick={() => document.getElementById('galleryInput')?.click()}>
              <div className="dropzone-icon">📸</div>
              <div className="dropzone-title">Ajouter des images à la galerie</div>
              <div className="dropzone-subtitle">Cliquez pour parcourir vos fichiers</div>
              <input id="galleryInput" type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={(e) => {
                  handleGallery(Array.from(e.target.files))
                  e.target.value = ''
                }} />
            </div>
            {(data.gallery || []).length > 0 && (
              <div className="gallery-grid">
                {data.gallery.map((item, i) => (
                  <div key={i} className="gallery-item"
                    style={{ backgroundImage: `url(${item.preview})` }}>
                    <button className="gallery-item-remove" onClick={() => removeGalleryItem(i)} type="button">✕</button>
                  </div>
                ))}
              </div>
            )}
          </FormField>
        </div>

        <div className="form-grid-full">
          <FormField label="Vidéo de présentation" hint="Lien YouTube ou Vimeo">
            <div className="input-with-icon">
              <span className="input-icon">▶</span>
              <input className="form-input" value={data.videoUrl}
                onChange={(e) => set('videoUrl')(e.target.value)}
                placeholder="https://youtube.com/watch?v=..." />
            </div>
          </FormField>
        </div>

        <div className="form-grid-full">
          <FormField label="Conditions particulières" hint="Affichées avant l'achat">
            <textarea className="form-textarea" value={data.terms}
              onChange={(e) => set('terms')(e.target.value)}
              placeholder="Ex: Pièce d'identité obligatoire, pas de remboursement après le 01/01/2024..."
              rows="4" />
          </FormField>
        </div>
      </div>
    </div>
  )
}
