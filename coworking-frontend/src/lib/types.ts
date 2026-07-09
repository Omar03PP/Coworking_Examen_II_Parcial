export interface User {
  id: number
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  status: boolean
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface Space {
  id: number
  name: string
  description: string | null
  location: string
  capacity: number
  type: 'SALA' | 'ESCRITORIO' | 'AUDITORIO'
  imageUrl: string | null
  status: boolean
  amenities?: Amenity[]
  createdAt: string
  updatedAt: string
}

export interface Amenity {
  id: number
  name: string
  icon: string | null
  spaceId: number
}

export interface Reservation {
  id: number
  userId: number
  spaceId: number
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FINALIZED'
  reason: string | null
  user?: User
  space?: Space
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: number
  rating: number
  comment: string | null
  userId: number
  spaceId: number
  reservationId: number
  user?: User
  createdAt: string
}

export interface Notification {
  id: number
  userId: number
  type: string
  message: string
  read: boolean
  createdAt: string
}

export interface ActivityLog {
  id: number
  userId: number | null
  action: string
  entity: string
  entityId: number | null
  metadata: string | null
  user?: { id: number; name: string; email: string }
  createdAt: string
}

export interface WaitlistEntry {
  id: number
  userId: number
  spaceId: number
  startTime: string
  endTime: string
  status: string
  space?: Space
  createdAt: string
}

export interface DashboardData {
  totalUsers: number
  totalSpaces: number
  totalReservations: number
  totalReviews: number
  activeReservations: number
  reservationsByDay: { date: string; count: number }[]
  recentActivity: ActivityLog[]
}

export interface ReviewStats {
  average: number
  count: number
}

export interface Favorite {
  id: number
  userId: number
  spaceId: number
  space?: Space
}

export interface TimeSlot {
  startTime: string
  endTime: string
  available: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
