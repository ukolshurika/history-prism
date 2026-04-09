import { Head, Link, useForm, router } from '@inertiajs/react'
import { useEffect, useMemo, useState } from 'react'
import Layout from '../Layout'
import { useTranslations } from '../../lib/useTranslations'

const ACTIVE_PROTOTYPE = 'strata'
const SCALE_MODES = [
  { id: 'decade', bucketSize: 10 },
  { id: 'mid', bucketSize: 5 },
  { id: 'year', bucketSize: 1 }
]

const TRACKS = [
  {
    key: 'personal',
    formCategory: 'person',
    accent: '#a64b2a',
    wash: 'rgba(166, 75, 42, 0.08)',
    border: 'rgba(166, 75, 42, 0.24)'
  },
  {
    key: 'local',
    formCategory: 'local',
    accent: '#2e5e4e',
    wash: 'rgba(46, 94, 78, 0.08)',
    border: 'rgba(46, 94, 78, 0.24)'
  },
  {
    key: 'world',
    formCategory: 'world',
    accent: '#355c9d',
    wash: 'rgba(53, 92, 157, 0.08)',
    border: 'rgba(53, 92, 157, 0.24)'
  }
]

const DATE_TYPES = [
  { value: 'exact' },
  { value: 'about' },
  { value: 'before' },
  { value: 'after' },
  { value: 'estimated' },
  { value: 'calculated' },
  { value: 'year' },
  { value: 'month_year' }
]

const EVENT_SEARCH_CATEGORIES = ['person', 'local', 'world', 'country']

function getFractionalYear(year, month, day) {
  if (!year) return null

  const safeMonth = month ? Number(month) : 1
  const safeDay = day ? Number(day) : 1
  return Number(year) + (safeMonth - 1) / 12 + (safeDay - 1) / 365
}

function formatEventDate(year, month, day, dateText, unknownLabel) {
  if (dateText) return dateText
  if (!year) return unknownLabel
  if (!month) return `${year}`
  if (!day) return `${String(month).padStart(2, '0')}/${year}`
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
}

function formatRangeLabel(event, unknownLabel) {
  const start = formatEventDate(event.start_year, event.start_month, event.start_day, event.start_date_text, unknownLabel)
  if (!event.end_year || event.end_year === event.start_year) return start

  const end = formatEventDate(event.end_year, event.end_month, event.end_day, event.end_date_text, unknownLabel)
  return `${start} - ${end}`
}

function normalizeTimelineEvents(categorizedEvents) {
  return TRACKS.flatMap((track) =>
    (categorizedEvents?.[track.key] || []).map((event) => {
      const start = getFractionalYear(event.start_year, event.start_month, event.start_day)
      const fallbackEnd = getFractionalYear(event.end_year, event.end_month, event.end_day)
      const end = fallbackEnd || start
      return {
        ...event,
        track: track.key,
        trackLabelKey: track.key,
        formCategory: track.formCategory,
        accent: track.accent,
        wash: track.wash,
        border: track.border,
        startValue: start,
        endValue: end || start,
        span: Math.max((end || start || 0) - (start || 0), 0)
      }
    })
  )
}

function computeRange(events) {
  const values = events
    .flatMap((event) => [event.startValue, event.endValue])
    .filter((value) => value !== null)

  if (values.length === 0) {
    return { min: 0, max: 1, span: 1 }
  }

  const min = Math.floor(Math.min(...values))
  const max = Math.ceil(Math.max(...values))
  return { min, max, span: Math.max(max - min, 1) }
}

function emptySearchState(category) {
  return {
    q: '',
    category,
    latitude: '',
    longitude: '',
    radius_km: '100'
  }
}

function buildSearchParams(filters, page) {
  const params = new URLSearchParams()
  params.set('format', 'json')
  params.set('page', String(page))

  if (filters.q) params.set('q', filters.q)
  if (filters.category) params.set('category', filters.category)
  if (filters.latitude) params.set('latitude', filters.latitude)
  if (filters.longitude) params.set('longitude', filters.longitude)
  if (filters.radius_km) params.set('radius_km', filters.radius_km)

  return params.toString()
}

function EventModalForm({ timeline, category, eventRecord = null, onClose, t }) {
  const isEdit = Boolean(eventRecord)
  const resolvedCategory = eventRecord?.formCategory || eventRecord?.category || category
  const { data, setData, post, put, processing, errors } = useForm({
    event: {
      title: eventRecord?.title || '',
      description: eventRecord?.description || '',
      category: resolvedCategory,
      timeline_id: timeline.id,
      start_date_attributes: {
        date_type: 'exact',
        year: eventRecord?.start_year ? String(eventRecord.start_year) : '',
        month: eventRecord?.start_month ? String(eventRecord.start_month) : '',
        day: eventRecord?.start_day ? String(eventRecord.start_day) : ''
      },
      end_date_attributes: {
        date_type: 'exact',
        year: eventRecord?.end_year ? String(eventRecord.end_year) : '',
        month: eventRecord?.end_month ? String(eventRecord.end_month) : '',
        day: eventRecord?.end_day ? String(eventRecord.end_day) : ''
      }
    }
  })

  const handleSubmit = (submitEvent) => {
    submitEvent.preventDefault()
    const submit = isEdit ? put : post
    const path = isEdit ? `/events/${eventRecord.id}` : '/events'

    submit(path, {
      preserveScroll: true,
      onSuccess: onClose
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-stone-200 bg-[#f8f4ee] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                {isEdit ? t('timelines.show.edit') : t('timelines.show.add_event')}
              </p>
              <h2
                className="mt-2 text-3xl text-stone-900"
                style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
              >
                {isEdit
                  ? t('timelines.show.edit_event', { category: t(`events.categories.${resolvedCategory}`) })
                  : t('timelines.show.create_new_event', { category: t(`events.categories.${resolvedCategory}`) })}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('timelines.show.close')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition hover:bg-white hover:text-stone-900"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">{t('events.form.title')}</span>
              <input
                type="text"
                value={data.event.title}
                onChange={(event) => setData('event.title', event.target.value)}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
                required
              />
              {errors['event.title'] && <p className="mt-2 text-sm text-red-600">{errors['event.title']}</p>}
            </label>

            <label className="block sm:row-span-2">
              <span className="mb-2 block text-sm font-medium text-stone-700">{t('events.form.description')}</span>
              <textarea
                value={data.event.description}
                onChange={(event) => setData('event.description', event.target.value)}
                className="h-full min-h-36 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
                rows="6"
              />
            </label>

            <DateFields
              title={t('events.form.start_date_required')}
              path="event.start_date_attributes"
              data={data.event.start_date_attributes}
              setData={setData}
              t={t}
            />

            <DateFields
              title={t('events.form.end_date')}
              path="event.end_date_attributes"
              data={data.event.end_date_attributes}
              setData={setData}
              t={t}
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={processing}
              className="rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing
                ? (isEdit ? t('events.form.updating') : t('events.form.creating'))
                : (isEdit ? t('events.form.update') : t('events.form.create'))}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 transition hover:bg-white"
            >
              {t('events.form.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EventSearchModal({ timeline, category, onClose, onCreateEvent, onAttachEvent, t }) {
  const [mode, setMode] = useState('simple')
  const [draftFilters, setDraftFilters] = useState(() => emptySearchState(category))
  const [appliedFilters, setAppliedFilters] = useState(() => emptySearchState(category))
  const [page, setPage] = useState(1)
  const [results, setResults] = useState([])
  const [meta, setMeta] = useState({ page: 1, per_page: 25, total: 0, total_pages: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function fetchSearchResults() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/events.json?${buildSearchParams(appliedFilters, page)}`)

        if (!response.ok) {
          throw new Error('Search failed')
        }

        const payload = await response.json()

        if (!active) return

        setResults(payload.events || [])
        setMeta(payload.meta || { page: 1, per_page: 25, total: 0, total_pages: 1 })
      } catch (fetchError) {
        if (!active) return

        setError(fetchError)
        setResults([])
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchSearchResults()

    return () => {
      active = false
    }
  }, [appliedFilters, page])

  const currentCategory = draftFilters.category || category || 'world'

  const handleSubmit = (submitEvent) => {
    submitEvent.preventDefault()
    setPage(1)
    setAppliedFilters({ ...draftFilters, category: draftFilters.category || category || '' })
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-stone-200 bg-[#f8f4ee] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">{t('timelines.show.search_events_label')}</p>
              <h2
                className="mt-2 text-3xl text-stone-900"
                style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
              >
                {t('timelines.show.search_existing_events', {
                  category: t(`events.categories.${currentCategory}`)
                })}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                {t('timelines.show.search_events_hint')}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('timelines.show.close')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition hover:bg-white hover:text-stone-900"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 rounded-[24px] border border-stone-200 bg-white/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex rounded-full bg-stone-100 p-1 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setMode('simple')}
                  className={`rounded-full px-3 py-1.5 transition ${mode === 'simple' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'}`}
                >
                  {t('timelines.show.simple_search')}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('advanced')}
                  className={`rounded-full px-3 py-1.5 transition ${mode === 'advanced' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'}`}
                >
                  {t('timelines.show.advanced_search')}
                </button>
              </div>

              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                {t('timelines.show.results_count', { count: meta.total || 0 })}
              </p>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">{t('timelines.show.search_query_label')}</span>
              <input
                type="text"
                value={draftFilters.q}
                onChange={(event) => setDraftFilters((current) => ({ ...current, q: event.target.value }))}
                placeholder={t('events.index.search_placeholder')}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
              />
            </label>

            {mode === 'advanced' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">{t('timelines.show.category_filter')}</span>
                  <select
                    value={draftFilters.category}
                    onChange={(event) => setDraftFilters((current) => ({ ...current, category: event.target.value }))}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
                  >
                    {EVENT_SEARCH_CATEGORIES.map((option) => (
                      <option key={option} value={option}>
                        {t(`events.categories.${option}`)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">{t('timelines.show.radius_km')}</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={draftFilters.radius_km}
                    onChange={(event) => setDraftFilters((current) => ({ ...current, radius_km: event.target.value }))}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">{t('timelines.show.latitude')}</span>
                  <input
                    type="number"
                    step="0.000001"
                    value={draftFilters.latitude}
                    onChange={(event) => setDraftFilters((current) => ({ ...current, latitude: event.target.value }))}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">{t('timelines.show.longitude')}</span>
                  <input
                    type="number"
                    step="0.000001"
                    value={draftFilters.longitude}
                    onChange={(event) => setDraftFilters((current) => ({ ...current, longitude: event.target.value }))}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
                  />
                </label>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                {t('timelines.show.search')}
              </button>
              <button
                type="button"
                onClick={() => onCreateEvent(draftFilters.category || category)}
                className="text-sm font-medium text-stone-700 underline decoration-stone-400 underline-offset-4 transition hover:text-stone-950"
              >
                {t('timelines.show.create_event')}
              </button>
            </div>
          </form>

          <div className="mt-6 space-y-4">
            {loading && <p className="text-sm text-stone-600">{t('timelines.show.searching')}</p>}
            {error && <p className="text-sm text-red-600">{t('timelines.show.search_failed')}</p>}

            {!loading && !error && results.length === 0 && (
              <p className="rounded-[22px] border border-dashed border-stone-300 bg-white/60 px-4 py-6 text-sm text-stone-600">
                {t('timelines.show.no_search_results')}
              </p>
            )}

            {results.length > 0 && (
              <div className="grid gap-3">
                {results.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-[22px] border border-stone-200 bg-white/80 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/events/${event.id}`}
                          className="text-sm font-medium text-stone-900 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-700"
                        >
                          {event.title}
                        </Link>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">
                          {t(`events.categories.${event.category}`)}
                        </div>
                      </div>
                      <div className="text-right text-xs text-stone-500">
                        <div>{event.start_date_display || event.start_date || t('timelines.show.unknown')}</div>
                        {event.location?.place && <div className="mt-1">{event.location.place}</div>}
                      </div>
                    </div>
                    {event.description && <p className="mt-3 text-sm leading-6 text-stone-700">{event.description}</p>}
                    <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => onAttachEvent(event)}
                        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-white"
                      >
                        {t('timelines.show.attach_event')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {meta.total_pages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('timelines.show.previous_page')}
                </button>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  {t('timelines.show.page_info', { page, total_pages: meta.total_pages })}
                </p>
                <button
                  type="button"
                  disabled={page >= meta.total_pages}
                  onClick={() => handlePageChange(page + 1)}
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('timelines.show.next_page')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DateFields({ title, path, data, setData, t }) {
  return (
    <fieldset className="rounded-[24px] border border-stone-200 bg-white/70 p-5">
      <legend className="px-2 text-sm font-medium text-stone-700">{title}</legend>
      <div className="grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm text-stone-600">{t('timelines.show.date_type')}</span>
          <select
            value={data.date_type}
            onChange={(event) => setData(`${path}.date_type`, event.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
          >
            {DATE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {t(`timelines.show.date_types.${type.value}`)}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="mb-2 block text-sm text-stone-600">{t('timelines.show.year')}</span>
            <input
              type="number"
              value={data.year}
              onChange={(event) => setData(`${path}.year`, event.target.value)}
              placeholder={t('timelines.show.placeholders.year')}
              min="1"
              max="9999"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-stone-600">{t('timelines.show.month')}</span>
            <input
              type="number"
              value={data.month}
              onChange={(event) => setData(`${path}.month`, event.target.value)}
              placeholder={t('timelines.show.placeholders.month')}
              min="1"
              max="12"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-stone-600">{t('timelines.show.day')}</span>
            <input
              type="number"
              value={data.day}
              onChange={(event) => setData(`${path}.day`, event.target.value)}
              placeholder={t('timelines.show.placeholders.day')}
              min="1"
              max="31"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
            />
          </label>
        </div>
      </div>
    </fieldset>
  )
}

function IconButton({ title, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  )
}

function HeroMeta({ timeline, range, t }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-0">
      <div className="border-l border-stone-600/25 pl-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-stone-700">{t('timelines.show.range')}</p>
        <p className="mt-2 text-lg text-stone-950">{range.min}-{range.max}</p>
      </div>
    </div>
  )
}

function ScaleControl({ activeScale, onScaleChange, t }) {
  return (
    <div className="inline-flex rounded-full p-0.5">
        {SCALE_MODES.map((mode) => {
          const isActive = mode.id === activeScale.id
          const label = t(`timelines.show.scale_modes.${mode.id}`)
          const parts = label.split(' ')
          const unit = parts.pop() || label
          const value = parts.join(' ')

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onScaleChange(mode.id)}
              className={`rounded-full px-3 py-1.5 text-xs transition hover:bg-white/55 ${
                isActive ? 'font-semibold text-stone-950' : 'text-stone-800'
              }`}
              aria-pressed={isActive}
            >
              {value ? `${value} ` : null}
              <span className={isActive ? 'underline underline-offset-4' : ''}>{unit}</span>
            </button>
          )
        })}
    </div>
  )
}

function StrataPrototype({ events, bucketSize, activeScale, onScaleChange, selectedEventId, onSelect, canEdit, onEdit, onRemove, onAddEvent, t }) {
  const grouped = new Map()

  events.forEach((event) => {
    const year = Math.floor(event.startValue || 0)
    const bucket = Math.floor(year / bucketSize) * bucketSize

    if (!grouped.has(bucket)) {
      grouped.set(bucket, {
        label: bucketSize === 1 ? `${bucket}` : `${bucket}-${bucket + bucketSize - 1}`,
        personal: [],
        local: [],
        world: []
      })
    }

    grouped.get(bucket)[event.track].push(event)
  })

  const sections = Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, section]) => section)

  return (
    <section className="border-t border-stone-600/18">
      <div className="sticky top-16 z-20 border-b border-stone-600/18 bg-[rgba(221,211,195,0.9)] py-4 backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[140px_repeat(3,minmax(0,1fr))] lg:gap-6">
          <div className="flex items-center">
            <ScaleControl activeScale={activeScale} onScaleChange={onScaleChange} t={t} />
          </div>
          {TRACKS.map((track) => (
            <div key={track.key} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: track.accent }} />
                <span className="truncate text-[11px] uppercase tracking-[0.22em] text-stone-700">{t(`timelines.show.tracks.${track.key}`)}</span>
              </div>
              {canEdit && (
                <IconButton
                  title={t('timelines.show.add_track_event', { track: t(`timelines.show.tracks.${track.key}`) })}
                  onClick={() => onAddEvent(track.formCategory)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stone-600/18 text-stone-700 transition hover:border-stone-600/32 hover:bg-white/55 hover:text-stone-900"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M10 4.5V15.5M4.5 10H15.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </IconButton>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="divide-y divide-stone-600/14">
        {sections.map((section) => {
          const selectedInSection = TRACKS.flatMap((track) => section[track.key]).find((event) => event.id === selectedEventId)

          return (
            <div key={section.label} className="py-8 first:pt-5">
              <div className="grid gap-6 lg:grid-cols-[140px_repeat(3,minmax(0,1fr))]">
                <div className="pt-1">
                  <div
                    className="text-2xl text-stone-900"
                    style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
                  >
                    {section.label}
                  </div>
                </div>
                {TRACKS.map((track) => (
                  <div key={track.key} className="space-y-3">
                    {section[track.key].length === 0 ? (
                      <div className="h-2" aria-hidden="true" />
                    ) : (
                      section[track.key].map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => onSelect(event)}
                          className={`block w-full rounded-[22px] border px-4 py-4 text-left transition ${
                            selectedEventId === event.id
                              ? 'bg-stone-900 text-white shadow-[0_18px_40px_rgba(28,25,23,0.18)]'
                              : 'bg-[#f3ecdf] text-stone-900 hover:bg-[#f7f1e6]'
                          }`}
                          style={{
                            borderColor: selectedEventId === event.id ? 'transparent' : event.border
                          }}
                        >
                          <div>
                            <div className="text-sm font-medium">{event.title}</div>
                            <div className={`mt-2 text-xs ${selectedEventId === event.id ? 'text-stone-300' : 'text-stone-600'}`}>
                              {formatRangeLabel(event, t('timelines.show.unknown'))}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                ))}
              </div>

              {selectedInSection && (
                <div className="mt-7 lg:pl-[140px]">
                  <div className="grid gap-4 border-l border-stone-600/22 pl-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div className="max-w-3xl">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-stone-700">{t(`timelines.show.tracks.${selectedInSection.trackLabelKey}`)}</p>
                      <h3
                        className="mt-3 text-2xl text-stone-900"
                        style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
                      >
                        {selectedInSection.title}
                      </h3>
                      <p className="mt-2 text-sm text-stone-700">{formatRangeLabel(selectedInSection, t('timelines.show.unknown'))}</p>
                      {selectedInSection.description ? (
                        <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-800">{selectedInSection.description}</p>
                      ) : (
                        <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-700">{t('timelines.show.no_description')}</p>
                      )}
                      {selectedInSection.source_url && (
                        <div className="mt-5">
                          <a
                            href={selectedInSection.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-stone-800 underline underline-offset-4 transition hover:text-stone-950"
                          >
                            {t('timelines.show.source')}
                          </a>
                        </div>
                      )}
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-1.5 lg:justify-end">
                        <IconButton
                          title={t('timelines.show.edit')}
                          onClick={() => onEdit(selectedInSection.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-600/18 text-stone-700 transition hover:border-stone-600/32 hover:bg-white/55 hover:text-stone-900"
                        >
                          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                            <path d="M4.75 14.75L8 14L14.9 7.1A1.5 1.5 0 0 0 14.9 4.98L14.02 4.1A1.5 1.5 0 0 0 11.9 4.1L5 11L4.75 14.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10.75 5.25L13.75 8.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </IconButton>
                        <IconButton
                          title={t('timelines.show.remove_from_timeline')}
                          onClick={() => onRemove(selectedInSection.id, selectedInSection.formCategory)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#a64b2a]/30 text-[#8f4328] transition hover:bg-[#a64b2a]/8 hover:text-[#7a3922]"
                        >
                          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                            <path d="M7.5 4.75h5M4.75 6.5h10.5M8.25 8.75v5.5M11.75 8.75v5.5M6.75 6.5l.5 8.25a1 1 0 0 0 1 .94h3.5a1 1 0 0 0 1-.94l.5-8.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </IconButton>
                        <IconButton
                          title={t('timelines.show.close_event_details')}
                          onClick={() => onSelect({ id: null })}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-600/18 text-stone-700 transition hover:border-stone-600/32 hover:bg-white/55 hover:text-stone-900"
                        >
                          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          </svg>
                        </IconButton>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function PulsePrototype({ events, range, bucketSize, selectedEventId, onSelect, t }) {
  const grouped = new Map()

  events.forEach((event) => {
    const bucket = Math.floor((event.startValue || range.min) / bucketSize) * bucketSize
    if (!grouped.has(bucket)) grouped.set(bucket, [])
    grouped.get(bucket).push(event)
  })

  const buckets = Array.from(grouped.entries()).sort((a, b) => a[0] - b[0])
  const activeBucket = selectedEventId
    ? Math.floor((events.find((event) => event.id === selectedEventId)?.startValue || range.min) / bucketSize) * bucketSize
    : buckets[0]?.[0]

  return (
    <section className="space-y-6 rounded-[34px] border border-stone-300 bg-[#e8dece] p-5 text-stone-900 sm:p-7">
      <div className="flex flex-col gap-4 border-b border-stone-300/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">{t('timelines.show.prototype_three')}</p>
          <h2
            className="mt-2 text-3xl"
            style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
          >
            {t('timelines.show.pulse')}
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-stone-600">
          {t('timelines.show.pulse_description')}
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        {buckets.map(([bucket, bucketEvents]) => {
          const isActive = activeBucket === bucket
          return (
            <button
              key={bucket}
              type="button"
              onClick={() => onSelect(bucketEvents[0])}
              className={`rounded-[26px] border p-4 text-left transition lg:col-span-2 ${
                isActive ? 'border-[#c6b191] bg-[#d8c6aa] text-stone-900' : 'border-stone-300 bg-white/60 hover:bg-white/80'
              }`}
            >
              <div className={`text-xs uppercase tracking-[0.2em] ${isActive ? 'text-stone-700' : 'text-stone-500'}`}>
                {bucketSize === 2 ? `${bucket}-${bucket + 1}` : `${bucket}-${bucket + bucketSize - 1}`}
              </div>
              <div className="mt-8 text-3xl">{bucketEvents.length}</div>
              <div className={`mt-1 text-xs ${isActive ? 'text-stone-700' : 'text-stone-500'}`}>{t('timelines.show.events_label')}</div>
            </button>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[30px] border border-stone-300 bg-white/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">{t('timelines.show.expanded_slice')}</p>
            <p className="text-xs text-stone-500">
              {bucketSize === 2 ? `${activeBucket}-${activeBucket + 1}` : `${activeBucket}-${activeBucket + bucketSize - 1}`}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(grouped.get(activeBucket) || []).map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelect(event)}
                className={`rounded-[22px] border px-4 py-4 text-left transition ${
                  selectedEventId === event.id ? 'border-transparent bg-white text-stone-900 shadow-lg' : 'border-stone-300 bg-[#f3ecdf] hover:bg-[#f7f1e6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: event.accent }} />
                  <span className={`text-xs uppercase tracking-[0.18em] ${selectedEventId === event.id ? 'text-stone-500' : 'text-stone-500'}`}>
                    {t(`timelines.show.tracks.${event.trackLabelKey}`)}
                  </span>
                </div>
                <div className="mt-4 text-sm font-medium">{event.title}</div>
                <div className={`mt-2 text-xs ${selectedEventId === event.id ? 'text-stone-500' : 'text-stone-500'}`}>
                  {formatRangeLabel(event, t('timelines.show.unknown'))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-stone-300 bg-white/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">{t('timelines.show.direction')}</p>
          <h3
            className="mt-4 text-2xl"
            style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
          >
            {t('timelines.show.direction_heading')}
          </h3>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            {t('timelines.show.direction_description')}
          </p>
          {selectedEventId && (
            <div className="mt-6 rounded-[24px] bg-white px-5 py-4 text-stone-900">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{t('timelines.show.selected_event')}</p>
              <p className="mt-3 text-lg">{events.find((event) => event.id === selectedEventId)?.title}</p>
              <p className="mt-2 text-sm text-stone-500">{formatRangeLabel(events.find((event) => event.id === selectedEventId), t('timelines.show.unknown'))}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Show({ timeline, can_edit, can_delete, current_user, flash }) {
  const t = useTranslations()
  const [scaleMode, setScaleMode] = useState('mid')
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showSearchForm, setShowSearchForm] = useState(false)
  const [newEventCategory, setNewEventCategory] = useState(null)
  const [editingEventId, setEditingEventId] = useState(null)

  const events = useMemo(() => normalizeTimelineEvents(timeline.categorized_events), [timeline.categorized_events])
  const range = useMemo(() => computeRange(events), [events])
  const activeScale = useMemo(
    () => SCALE_MODES.find((mode) => mode.id === scaleMode) || SCALE_MODES[1],
    [scaleMode]
  )
  const selectedEvent = useMemo(
    () => (selectedEventId ? events.find((event) => event.id === selectedEventId) || null : null),
    [events, selectedEventId]
  )
  const editingEvent = useMemo(
    () => (editingEventId ? events.find((event) => event.id === editingEventId) || null : null),
    [events, editingEventId]
  )

  const handleSelectEvent = (event) => {
    const nextId = event?.id || null
    setSelectedEventId((currentId) => (currentId === nextId ? null : nextId))
  }

  const handleAddEvent = (category) => {
    setNewEventCategory(category)

    if (category === 'person') {
      setShowCreateForm(true)
      return
    }

    setShowSearchForm(true)
  }

  const handleCreateFromSearch = (category) => {
    setNewEventCategory(category)
    setShowSearchForm(false)
    setShowCreateForm(true)
  }

  const handleAttachEvent = (eventRecord) => {
    const currentCache = timeline.cached_events_for_display || {}
    const cacheKey = eventRecord.category
    const updatedEventIds = [...new Set([...(currentCache[cacheKey] || []), eventRecord.id])]
    const updatedCache = { ...currentCache, [cacheKey]: updatedEventIds }

    router.put(
      `/timelines/${timeline.id}`,
      {
        timeline: {
          cached_events_for_display: updatedCache
        }
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setShowSearchForm(false)
          setNewEventCategory(null)
        }
      }
    )
  }

  const handleDeleteEvent = (eventId, category) => {
    if (!window.confirm(t('timelines.show.remove_event_confirm'))) return

    const currentCache = timeline.cached_events_for_display || {}
    const updatedEventIds = (currentCache[category] || []).filter((id) => id !== eventId)
    const updatedCache = { ...currentCache, [category]: updatedEventIds }

    router.put(
      `/timelines/${timeline.id}`,
      {
        timeline: {
          cached_events_for_display: updatedCache
        }
      },
      {
        preserveScroll: true
      }
    )
  }

  const handleEditEvent = (eventId) => {
    setEditingEventId(eventId)
  }

  const renderPrototype = () => {
    if (events.length === 0) {
      return (
        <div className="rounded-[34px] border border-dashed border-stone-300 bg-white/55 px-8 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-stone-500">{t('timelines.show.empty_timeline')}</p>
          <h2
            className="mt-4 text-3xl text-stone-900"
            style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
          >
            {t('timelines.show.no_events')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-600">
            {t('timelines.show.empty_description')}
          </p>
        </div>
      )
    }

    switch (ACTIVE_PROTOTYPE) {
      case 'pulse':
        return (
          <PulsePrototype
            events={events}
            range={range}
            bucketSize={activeScale.bucketSize === 1 ? 2 : activeScale.bucketSize}
            selectedEventId={selectedEvent?.id}
            onSelect={handleSelectEvent}
            t={t}
          />
        )
      case 'strata':
      default:
        return (
          <StrataPrototype
            events={events}
            bucketSize={activeScale.bucketSize}
            activeScale={activeScale}
            onScaleChange={setScaleMode}
            selectedEventId={selectedEvent?.id}
            onSelect={handleSelectEvent}
            canEdit={can_edit}
            onEdit={handleEditEvent}
            onRemove={handleDeleteEvent}
            onAddEvent={handleAddEvent}
            t={t}
          />
        )
    }
  }

  return (
    <Layout current_user={current_user} flash={flash} immersive>
      <Head title={timeline.title} />

      <div className="-mt-16 min-h-screen bg-[#ddd3c3] pt-16">
        <div className="relative">
          <div className="relative z-10 mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
            <section className="pb-12">
              <div className="max-w-4xl">
                <div className="text-[11px] uppercase tracking-[0.4em] text-stone-700">
                  <Link href="/timelines" className="transition hover:text-stone-950">
                    {t('timelines.show.timeline')}
                  </Link>
                  <span className="px-2 text-stone-500/70" aria-hidden="true">/</span>
                  <span className="text-stone-950">{timeline.title}</span>
                </div>
                <h1
                  className="mt-5 max-w-4xl text-5xl leading-none text-stone-700 sm:text-6xl lg:text-[5.5rem]"
                  style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
                >
                  {timeline.person_name && (
                    <>
                      {timeline.person_id ? (
                        <Link
                          href={`/people/${timeline.person_id}`}
                          className="transition hover:text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-600/25"
                        >
                          {timeline.person_name}
                        </Link>
                      ) : (
                        timeline.person_name
                      )}
                    </>
                  )}
                </h1>
              </div>

              <div className="mt-12 flex min-h-[136px] flex-col justify-center gap-6 border-y border-stone-600/25 py-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-5xl flex-1">
                  <HeroMeta timeline={timeline} range={range} t={t} />
                </div>

                <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                  {can_edit && (
                    <Link
                      href={`/timelines/${timeline.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-full border border-stone-700/30 bg-[#f6f0e5] px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-700/40 hover:bg-[#fbf7ef]"
                    >
                      <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                        <path d="M4.75 14.75L8 14L14.9 7.1A1.5 1.5 0 0 0 14.9 4.98L14.02 4.1A1.5 1.5 0 0 0 11.9 4.1L5 11L4.75 14.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.75 5.25L13.75 8.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t('timelines.show.edit')}
                    </Link>
                  )}
                  {can_edit && (
                    <button
                      type="button"
                      onClick={() => router.post(`/timelines/${timeline.id}/export_pdf`)}
                      className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
                    >
                      {t('timelines.show.generate_pdf')}
                    </button>
                  )}
                  {timeline.pdf_url && (
                    <Link
                      href={`/timelines/${timeline.id}/download_pdf`}
                      className="rounded-full border border-stone-700/30 bg-[#f6f0e5] px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-700/40 hover:bg-[#fbf7ef]"
                    >
                      {t('timelines.show.download_pdf')}
                    </Link>
                  )}
                </div>
              </div>
            </section>

            <section className="relative px-0 pt-1 sm:pt-2">
              {renderPrototype()}
            </section>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <EventModalForm
          timeline={timeline}
          category={newEventCategory}
          onClose={() => {
            setShowCreateForm(false)
            setNewEventCategory(null)
          }}
          t={t}
        />
      )}

      {showSearchForm && (
        <EventSearchModal
          timeline={timeline}
          category={newEventCategory}
          onClose={() => {
            setShowSearchForm(false)
            setNewEventCategory(null)
          }}
          onCreateEvent={handleCreateFromSearch}
          onAttachEvent={handleAttachEvent}
          t={t}
        />
      )}

      {editingEvent && (
        <EventModalForm
          timeline={timeline}
          eventRecord={editingEvent}
          onClose={() => setEditingEventId(null)}
          t={t}
        />
      )}
    </Layout>
  )
}
