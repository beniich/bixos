import { ApiError } from './authApi'
import type {
  Venue,
  VenueLayout,
  VenueFilters,
  SeatSection,
  Seat,
  SeatCategory
} from '../types/venue'

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const call = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }))
    throw new ApiError(error.error || `HTTP ${response.status}`, response.status, error)
  }
  return response.json()
}

export const venueApi = {
  // LIST
  async list(filters: VenueFilters = {}): Promise<{
    venues: Venue[]
    total: number
    page: number
    totalPages: number
  }> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
        params.append(k, Array.isArray(v) ? v.join(',') : String(v))
      }
    })
    return call(`/venues?${params.toString()}`)
  },

  // GET ONE
  async get(id: string): Promise<{ venue: Venue; layout?: VenueLayout; upcomingEvents: number }> {
    return call(`/venues/${id}`)
  },

  // CRUD
  async create(data: Omit<Venue, 'id' | 'createdAt' | 'updatedAt' | 'slug'>): Promise<{ venue: Venue }> {
    return call('/venues', { method: 'POST', body: JSON.stringify(data) })
  },

  async update(id: string, data: Partial<Venue>): Promise<{ venue: Venue }> {
    return call(`/venues/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return call(`/venues/${id}`, { method: 'DELETE' })
  },

  // LAYOUT
  async getLayout(venueId: string): Promise<{ layout: VenueLayout }> {
    return call(`/venues/${venueId}/layout`)
  },

  async saveLayout(venueId: string, layout: VenueLayout): Promise<{ layout: VenueLayout }> {
    return call(`/venues/${venueId}/layout`, { method: 'PUT', body: JSON.stringify(layout) })
  },

  async publishLayout(venueId: string, layoutId: string): Promise<{ success: boolean }> {
    return call(`/venues/${venueId}/layout/${layoutId}/publish`, { method: 'POST' })
  },

  // SECTIONS
  async addSection(venueId: string, section: Omit<SeatSection, 'id' | 'layoutId'>): Promise<{ section: SeatSection }> {
    return call(`/venues/${venueId}/sections`, { method: 'POST', body: JSON.stringify(section) })
  },

  async updateSection(venueId: string, sectionId: string, data: Partial<SeatSection>): Promise<{ section: SeatSection }> {
    return call(`/venues/${venueId}/sections/${sectionId}`, { method: 'PATCH', body: JSON.stringify(data) })
  },

  async deleteSection(venueId: string, sectionId: string): Promise<{ success: boolean; seatsDeleted: number }> {
    return call(`/venues/${venueId}/sections/${sectionId}`, { method: 'DELETE' })
  },

  async bulkDeleteSections(venueId: string, sectionIds: string[]): Promise<{ success: boolean; seatsDeleted: number }> {
    return call(`/venues/${venueId}/sections/bulk-delete`, { method: 'POST', body: JSON.stringify({ sectionIds }) })
  },

  async generateSeatsForSection(
    venueId: string,
    sectionId: string
  ): Promise<{ success: boolean; seatsCreated: number }> {
    return call(`/venues/${venueId}/sections/${sectionId}/generate-seats`, { method: 'POST' })
  },

  // CATEGORIES
  async addCategory(venueId: string, category: Omit<SeatCategory, 'id' | 'layoutId'>): Promise<{ category: SeatCategory }> {
    return call(`/venues/${venueId}/categories`, { method: 'POST', body: JSON.stringify(category) })
  },

  async updateCategory(venueId: string, categoryId: string, data: Partial<SeatCategory>): Promise<{ category: SeatCategory }> {
    return call(`/venues/${venueId}/categories/${categoryId}`, { method: 'PATCH', body: JSON.stringify(data) })
  },

  async deleteCategory(venueId: string, categoryId: string): Promise<{ success: boolean }> {
    return call(`/venues/${venueId}/categories/${categoryId}`, { method: 'DELETE' })
  },

  // SEATS
  async updateSeat(venueId: string, seatId: string, data: Partial<Seat>): Promise<{ seat: Seat }> {
    return call(`/venues/${venueId}/seats/${seatId}`, { method: 'PATCH', body: JSON.stringify(data) })
  },

  async bulkUpdateSeats(
    venueId: string,
    seatIds: string[],
    data: Partial<Seat>
  ): Promise<{ success: boolean; updated: number }> {
    return call(`/venues/${venueId}/seats/bulk-update`, {
      method: 'POST',
      body: JSON.stringify({ seatIds, data })
    })
  },

  // GEOLOCATION
  async nearby(latitude: number, longitude: number, radiusKm = 50): Promise<{ venues: Venue[] }> {
    return call(`/venues/nearby?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`)
  },

  // UTILS
  async validateAddress(address: string, city: string, postalCode: string, country: string): Promise<{
    valid: boolean
    latitude?: number
    longitude?: number
    normalized?: { address: string; city: string; postalCode: string }
  }> {
    return call('/venues/validate-address', {
      method: 'POST',
      body: JSON.stringify({ address, city, postalCode, country })
    })
  },

  async uploadImage(venueId: string, file: File, type: 'cover' | 'gallery'): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await fetch(`${API_URL}/venues/${venueId}/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    if (!response.ok) throw new ApiError('Upload failed', response.status)
    return response.json()
  }
}
