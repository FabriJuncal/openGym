// Tiny dependency-free i18n. English source strings are the keys; locale files in
// src/locales/ map them to translations and are lazy-loaded (Vite code-splits each
// import.meta.glob entry), so the initial bundle stays English-only.
// Exercise instructions and localized exercise names are separately generated packs.
// Both stay out of the initial English bundle and load only on a language switch.
import { useSyncExternalStore } from 'react'

// UI languages. de/pt have no instruction pack upstream — instructions fall back to English.
export const LANGS = {
  en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français', it: 'Italiano',
  pt: 'Português', pl: 'Polski', tr: 'Türkçe', ru: 'Русский', zh: '中文',
  ko: '한국어', hi: 'हिन्दी'
}
export const INSTR_LANGS = ['en', 'es', 'fr', 'it', 'tr', 'ru', 'zh', 'hi', 'pl', 'ko']
const DATE_LOCALES = {
  en: 'en-GB', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', pt: 'pt-PT',
  pl: 'pl-PL', tr: 'tr-TR', ru: 'ru-RU', zh: 'zh-CN', ko: 'ko-KR', hi: 'hi-IN'
}

const localePacks = import.meta.glob('../locales/*.js')
const instrPacks = import.meta.glob('../instr/*.js')
const namePacks = import.meta.glob('../exercise-names/*.js')

let lang = 'en'
let dict = {}
let instr = null            // { exId: [steps] } for the current language, null = English
let names = null            // { exId: localizedName } for the current language, null = canonical English
let version = 0
let request = 0
let requestedLang = 'en'
const subs = new Set()
const notify = () => { version++; subs.forEach(f => f()) }

export const getLang = () => lang
export const dateLocale = () => DATE_LOCALES[lang] || 'en-GB'
export const normalizeExerciseText = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

// Translate a source string; {0},{1}… are replaced with args (also on the English fallback).
export function t(s, ...args) {
  let v = dict[s] || s
  for (let i = 0; i < args.length; i++) v = v.replaceAll('{' + i + '}', args[i])
  return v
}
// Instructions for an exercise in the current language (English steps as fallback).
export const instrFor = ex => (instr && instr[ex.id]) || ex.st || []
// Exercise names are presentation only. The canonical English `n` and stable `id`
// remain untouched for imports, persistence and historical snapshots.
export const nameFor = ex => {
  if (!ex) return ''
  if (ex.custom) return ex.n || ''
  return (names && names[ex.id]) || ex.n || ''
}
export const matchesExerciseName = (ex, query) => {
  const q = normalizeExerciseText(query)
  return !q || normalizeExerciseText(nameFor(ex)).includes(q) || normalizeExerciseText(ex?.n).includes(q)
}

const loadPack = (packs, path, fallback) => {
  const loader = packs[path]
  return loader ? loader().then(mod => mod.default).catch(() => fallback) : Promise.resolve(fallback)
}

export async function setLang(l) {
  if (!LANGS[l]) l = 'en'
  if (l === requestedLang && version > 0) return
  requestedLang = l
  const currentRequest = ++request
  const [nextDict, nextInstr, nextNames] = await Promise.all([
    l === 'en' ? Promise.resolve({}) : loadPack(localePacks, '../locales/' + l + '.js', {}),
    l === 'en' || !INSTR_LANGS.includes(l) ? Promise.resolve(null) : loadPack(instrPacks, '../instr/' + l + '.js', null),
    l === 'en' ? Promise.resolve(null) : loadPack(namePacks, '../exercise-names/' + l + '.js', null)
  ])
  // Imports can resolve out of order when a person changes language quickly. Only
  // the most recent selection is allowed to replace all three resources.
  if (currentRequest !== request) return
  lang = l
  dict = nextDict
  instr = nextInstr
  names = nextNames
  notify()
}

// Re-renders the subscribing component (and its children) whenever the language changes.
export function useLang() {
  return useSyncExternalStore(fn => { subs.add(fn); return () => subs.delete(fn) }, () => version)
}
