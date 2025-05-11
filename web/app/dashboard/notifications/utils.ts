import { Bell, Check, X, AlertCircle, Info } from 'lucide-react'

export const getNotificationIcon = (type: 'info' | 'alert' | 'success' | 'error') => {
  switch (type) {
    case 'info': return Info
    case 'alert': return AlertCircle
    case 'success': return Check
    case 'error': return X
    default: return Bell
  }
}

export const getNotificationColor = (type: 'info' | 'alert' | 'success' | 'error') => {
  switch (type) {
    case 'info': return 'bg-blue-500'
    case 'alert': return 'bg-yellow-500'
    case 'success': return 'bg-green-500'
    case 'error': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
} 