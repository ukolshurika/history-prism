import { usePage } from '@inertiajs/react'
import defaultTranslations from './defaultTranslations'

function lookupTranslation(translations, key) {
  return key.split('.').reduce((value, segment) => {
    if (value && typeof value === 'object') return value[segment]
    return undefined
  }, translations)
}

function interpolate(value, replacements = {}) {
  return Object.entries(replacements).reduce(
    (result, [key, replacement]) => result.replaceAll(`%{${key}}`, String(replacement)),
    value,
  )
}

function humanizeKey(key) {
  const lastSegment = key.split('.').pop() || key
  return lastSegment
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function useTranslations() {
  let translations = {}

  try {
    translations = usePage().props?.translations || {}
  } catch {
    translations = defaultTranslations
  }

  const sourceTranslations = Object.keys(translations).length > 0 ? translations : defaultTranslations

  return (key, replacements = {}, fallback = key) => {
    const value = lookupTranslation(sourceTranslations, key)
    if (typeof value !== 'string') return fallback === key ? humanizeKey(key) : fallback
    return interpolate(value, replacements)
  }
}
