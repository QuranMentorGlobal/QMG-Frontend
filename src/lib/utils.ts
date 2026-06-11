// src/lib/utils.ts
// Utility helpers used across the app

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merges Tailwind classes safely (no duplicate/conflicting classes)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format a USD amount: 18 → "$18.00"
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Format a date string: "2024-12-01" → "Dec 1, 2024"
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

// Format a time string: "18:00:00" → "6:00 PM"
export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// Course type → display name
export function courseTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    noorani_qaida:  'Noorani Qaida',
    tajweed:        'Tajweed',
    hifz:           'Hifz (Memorization)',
    tafseer:        'Tafseer',
    islamic_studies:'Islamic Studies',
    ijazah:         'Ijazah',
  }
  return labels[type] ?? type
}

// Get user's initials for avatar fallback: "Ahmed Khan" → "AK"
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// Star rating → array of filled/empty stars
export function getStars(rating: number): ('full' | 'half' | 'empty')[] {
  return Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return 'full'
    if (i < rating) return 'half'
    return 'empty'
  })
}
