export interface Venue {
  id: string
  name: string
  slug: string
  description: string
  coverImage?: string
  gallery: string[]
  videoUrl?: string
  address: string
  city: string
  postalCode: string
  country: string
  latitude?: number
  longitude?: number
  capacity: number
  totalArea?: number
  yearBuilt?: number
  amenities: VenueAmenity[]
  venueType: VenueType
  transportInfo: TransportOption[]
  parkingInfo?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  accessibility: AccessibilityInfo
  rules?: string[]
  layoutId?: string
  ownerId: string
  organizationId?: string
  status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED' | 'DRAFT'
  createdAt: string
  updatedAt: string
}

export type VenueType =
  | 'CONCERT_HALL' | 'THEATER' | 'SPORTS_ARENA' | 'STADIUM'
  | 'CONFERENCE_CENTER' | 'EXHIBITION' | 'CLUB' | 'OUTDOOR'
  | 'CHURCH' | 'OTHER'

export type VenueAmenity =
  | 'WIFI' | 'PARKING' | 'RESTAURANT' | 'BAR' | 'AIR_CONDITIONING'
  | 'HEATING' | 'STAGE' | 'SOUND_SYSTEM' | 'LIGHTING_RIG' | 'BACKSTAGE'
  | 'DRESSING_ROOMS' | 'VIP_LOUNGE' | 'FOOD_STANDS' | 'MERCH_STORE'
  | 'FIRST_AID' | 'SMOKING_AREA' | 'WHEELCHAIR_ACCESS' | 'AUDIO_DESCRIPTION'
  | 'SIGN_LANGUAGE' | 'ELEVATOR'

export interface TransportOption {
  type: 'METRO' | 'BUS' | 'TRAIN' | 'TRAM' | 'BIKE' | 'CAR' | 'WALK'
  line?: string
  station: string
  distanceMinutes: number
  description?: string
}

export interface AccessibilityInfo {
  wheelchairAccessible: boolean
  hearingLoop: boolean
  audioDescription: boolean
  signLanguage: boolean
  serviceAnimals: boolean
  accessibleRestrooms: boolean
  accessibleParking: boolean
  notes?: string
}

// ─── LAYOUT ────────────────────────────────────────────────────────────
export interface VenueLayout {
  id: string
  venueId: string
  name: string
  width: number
  height: number
  scale: number
  stage: StageConfig
  sections: SeatSection[]
  seats: Seat[]
  categories: SeatCategory[]
  gridEnabled: boolean
  gridSize: number
  snapToGrid: boolean
  publishedAt?: string
  publishedBy?: string
}

export interface StageConfig {
  x: number
  y: number
  width: number
  height: number
  label: string
  shape: 'RECTANGLE' | 'TRAPEZOID' | 'CIRCULAR' | 'CUSTOM'
  customPath?: string
  rotation?: number
}

export interface SeatSection {
  id: string
  layoutId: string
  name: string
  color: string
  shape: 'RECTANGLE' | 'POLYGON' | 'CIRCLE' | 'CUSTOM'
  coordinates: SectionCoordinates
  capacity: number
  rowCount: number
  seatsPerRow: number
  rowGap: number
  seatGap: number
  startingRow: string
  startingNumber: number
  categoryId: string
  rotation: number
  customPath?: string
  zIndex: number
}

export interface SectionCoordinates {
  x: number
  y: number
  width: number
  height: number
  points?: Array<{ x: number; y: number }>
}

export interface Seat {
  id: string
  layoutId: string
  sectionId: string
  row: string
  number: number
  x: number
  y: number
  width: number
  height: number
  categoryId: string
  status: 'AVAILABLE' | 'BLOCKED'
  accessible: boolean
  viewQuality: 1 | 2 | 3 | 4 | 5
  notes?: string
}

export interface SeatCategory {
  id: string
  layoutId: string
  name: string
  color: string
  description?: string
  basePrice: number
  perks: string[]
  displayOrder: number
}

export interface VenueFilters {
  search?: string
  city?: string
  venueType?: VenueType | 'ALL'
  minCapacity?: number
  maxCapacity?: number
  amenities?: VenueAmenity[]
  accessible?: boolean
  status?: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED' | 'DRAFT' | 'ALL'
  sortBy?: 'name' | 'capacity' | 'createdAt' | 'city'
  sortOrder?: 'asc' | 'desc'
  page?: number
  perPage?: number
}

export const VENUE_TYPE_LABELS: Record<VenueType, { label: string; icon: string }> = {
  CONCERT_HALL: { label: 'Salle de concert', icon: '🎵' },
  THEATER: { label: 'Théâtre', icon: '🎭' },
  SPORTS_ARENA: { label: 'Arena sportive', icon: '🏟' },
  STADIUM: { label: 'Stade', icon: '⚽' },
  CONFERENCE_CENTER: { label: 'Centre de conférence', icon: '💼' },
  EXHIBITION: { label: "Espace d'exposition", icon: '🎨' },
  CLUB: { label: 'Club', icon: '🎤' },
  OUTDOOR: { label: 'Extérieur', icon: '🌳' },
  CHURCH: { label: 'Église', icon: '⛪' },
  OTHER: { label: 'Autre', icon: '🏛' }
}

export const AMENITY_LABELS: Record<VenueAmenity, { label: string; icon: string }> = {
  WIFI: { label: 'WiFi', icon: '📶' },
  PARKING: { label: 'Parking', icon: '🅿️' },
  RESTAURANT: { label: 'Restaurant', icon: '🍽' },
  BAR: { label: 'Bar', icon: '🍺' },
  AIR_CONDITIONING: { label: 'Climatisation', icon: '❄️' },
  HEATING: { label: 'Chauffage', icon: '🔥' },
  STAGE: { label: 'Scène', icon: '🎭' },
  SOUND_SYSTEM: { label: 'Sonorisation', icon: '🔊' },
  LIGHTING_RIG: { label: 'Régie lumière', icon: '💡' },
  BACKSTAGE: { label: 'Coulisses', icon: '🚪' },
  DRESSING_ROOMS: { label: 'Loges', icon: '👔' },
  VIP_LOUNGE: { label: 'Lounge VIP', icon: '🥂' },
  FOOD_STANDS: { label: 'Stands de nourriture', icon: '🌮' },
  MERCH_STORE: { label: 'Boutique', icon: '🛍' },
  FIRST_AID: { label: 'Premiers secours', icon: '🚑' },
  SMOKING_AREA: { label: 'Espace fumeur', icon: '🚬' },
  WHEELCHAIR_ACCESS: { label: 'Accès PMR', icon: '♿' },
  AUDIO_DESCRIPTION: { label: 'Audio-description', icon: '👂' },
  SIGN_LANGUAGE: { label: 'Langue des signes', icon: '🤟' },
  ELEVATOR: { label: 'Ascenseur', icon: '🛗' }
}
