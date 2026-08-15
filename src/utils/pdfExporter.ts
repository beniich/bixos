/**
 * PDF Exporter — Fonctions utilitaires pour téléchargement et impression
 */

/**
 * Télécharge un Blob sous forme de fichier
 */
export async function downloadAsPDF(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

/**
 * Ouvre une fenêtre d'impression pour un Blob HTML
 */
export async function printPDF(blob: Blob): Promise<void> {
  const url = URL.createObjectURL(blob)

  return new Promise((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;'
    document.body.appendChild(iframe)

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } catch (e) {
        // Fallback : ouvrir dans nouvel onglet
        window.open(url, '_blank')
      }
      setTimeout(() => {
        document.body.removeChild(iframe)
        URL.revokeObjectURL(url)
        resolve()
      }, 2000)
    }

    iframe.src = url
  })
}
