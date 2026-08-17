/**
 * Télécharge un Blob PDF en tant que fichier
 */
export const downloadAsPDF = async (
  blob: Blob,
  filename: string
): Promise<void> => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()

  // Nettoyage
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * Ouvre le PDF dans un nouvel onglet
 */
export const openPDFInNewTab = async (blob: Blob): Promise<void> => {
  const url = URL.createObjectURL(blob)
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')

  if (!newWindow) {
    throw new Error('Pop-up bloqué. Autorisez les pop-ups pour cette URL.')
  }

  // Nettoyage après 60s
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

/**
 * Lance l'impression directe du PDF
 */
export const printPDF = async (blob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const iframe = document.createElement('iframe')

    iframe.style.position = 'fixed'
    iframe.style.right = '-9999px'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    iframe.src = url

    document.body.appendChild(iframe)

    iframe.onload = () => {
      // Petit délai pour laisser le PDF se charger
      setTimeout(() => {
        try {
          const contentWindow = iframe.contentWindow
          if (!contentWindow) {
            throw new Error('Iframe inaccessible')
          }

          contentWindow.focus()

          // Détection mobile : montrer le PDF au lieu d'imprimer directement
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
          if (!isMobile) {
            contentWindow.print()
          }

          resolve()
        } catch (err) {
          reject(err)
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe)
            }
            URL.revokeObjectURL(url)
          }, 1500)
        }
      }, 500)
    }

    iframe.onerror = (err) => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe)
      }
      URL.revokeObjectURL(url)
      reject(err)
    }
  })
}

/**
 * Partage le PDF via Web Share API (mobile)
 */
export const sharePDF = async (
  blob: Blob,
  filename: string,
  title: string,
  text: string
): Promise<boolean> => {
  if (!navigator.share || !navigator.canShare) {
    return false
  }

  const file = new File([blob], filename, { type: 'application/pdf' })

  if (!navigator.canShare({ files: [file] })) {
    return false
  }

  try {
    await navigator.share({
      title,
      text,
      files: [file]
    })
    return true
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return true // Utilisateur a annulé
    }
    return false
  }
}

/**
 * Convertit Blob en Base64 (utile pour envoi serveur)
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Estimation de la taille d'un PDF avant génération
 */
export const estimatePDFSize = (
  ticketCount: number,
  layout: string
): { sizeMB: number; pages: number; sheets: number } => {
  const ticketsPerPage: Record<string, number> = {
    SINGLE: 1,
    TWO_COLUMN: 2,
    FOUR_GRID: 4,
    BADGE_SHEET: 10,
    AVERY_5160: 30,
    AVERY_5163: 20
  }
  const perPage = ticketsPerPage[layout] || 2
  const pages = Math.max(1, Math.ceil(ticketCount / perPage))

  // ~150KB par billet (avec QR code haute qualité)
  const sizeBytes = ticketCount * 150 * 1024
  const sizeMB = Math.max(0.1, sizeBytes / (1024 * 1024))

  return {
    sizeMB: Math.round(sizeMB * 100) / 100,
    pages,
    sheets: pages
  }
}

// TODO: implémenter combinePDFs si nécessaire

/**
 * Combine plusieurs PDFs en un seul
 */
export const mergePDFs = async (blobs: Blob[]): Promise<Blob> => {
  const { PDFDocument } = await import('pdf-lib')

  const merged = await PDFDocument.create()

  for (const blob of blobs) {
    const arrayBuffer = await blob.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const pages = await merged.copyPages(pdf, pdf.getPageIndices())
    pages.forEach((page) => merged.addPage(page))
  }

  const mergedBytes = await merged.save()
  return new Blob([mergedBytes], { type: 'application/pdf' })
}
