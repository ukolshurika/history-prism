import { Head, Link, useForm, router } from '@inertiajs/react'
import { useMemo, useState } from 'react'
import Layout from '../Layout'

const PROTOTYPES = [
  {
    id: 'ribbon',
    name: 'Ribbon',
    eyebrow: 'Recommended',
    title: 'A continuous horizontal canvas for a life at full scale.',
    description: 'The entire viewport becomes a navigable timeline. Zoom reveals detail, overlap resolves into lanes, and the mini-map keeps orientation.'
  },
  {
    id: 'strata',
    name: 'Strata',
    eyebrow: 'Editorial',
    title: 'A vertical chronicle with three clear historical layers.',
    description: 'Personal, place, and global events stay visually separated while dense years collapse into compact clusters.'
  },
  {
    id: 'pulse',
    name: 'Pulse',
    eyebrow: 'Overview',
    title: 'A decade-level pulse that opens and closes with distance.',
    description: 'At a glance it shows intensity, then opens into individual episodes as you move closer.'
  }
]

const TRACKS = [
  {
    key: 'personal',
    formCategory: 'person',
    label: 'Personal',
    accent: '#a64b2a',
    wash: 'rgba(166, 75, 42, 0.08)',
    border: 'rgba(166, 75, 42, 0.24)'
  },
  {
    key: 'local',
    formCategory: 'local',
    label: 'Local',
    accent: '#2e5e4e',
    wash: 'rgba(46, 94, 78, 0.08)',
    border: 'rgba(46, 94, 78, 0.24)'
  },
  {
    key: 'world',
    formCategory: 'world',
    label: 'World',
    accent: '#355c9d',
    wash: 'rgba(53, 92, 157, 0.08)',
    border: 'rgba(53, 92, 157, 0.24)'
  }
]

const DATE_TYPES = [
  { value: 'exact', label: 'Exact' },
  { value: 'about', label: 'About' },
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'estimated', label: 'Estimated' },
  { value: 'calculated', label: 'Calculated' },
  { value: 'year', label: 'Year Only' },
  { value: 'month_year', label: 'Month/Year' }
]

function getFractionalYear(year, month, day) {
  if (!year) return null

  const safeMonth = month ? Number(month) : 1
  const safeDay = day ? Number(day) : 1
  return Number(year) + (safeMonth - 1) / 12 + (safeDay - 1) / 365
}

function formatEventDate(year, month, day, dateText) {
  if (dateText) return dateText
  if (!year) return 'Unknown'
  if (!month) return `${year}`
  if (!day) return `${year}-${String(month).padStart(2, '0')}`
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatRangeLabel(event) {
  const start = formatEventDate(event.start_year, event.start_month, event.start_day, event.start_date_text)
  if (!event.end_year || event.end_year === event.start_year) return start

  const end = formatEventDate(event.end_year, event.end_month, event.end_day, event.end_date_text)
  return `${start} -> ${end}`
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
        trackLabel: track.label,
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

function assignLanes(events) {
  const sorted = [...events].sort((a, b) => {
    if (a.startValue === b.startValue) return (a.endValue || a.startValue) - (b.endValue || b.startValue)
    return a.startValue - b.startValue
  })

  const laneEnds = []

  return sorted.map((event) => {
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= event.startValue)

    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(event.endValue + 0.05)
    } else {
      laneEnds[lane] = event.endValue + 0.05
    }

    return {
      ...event,
      lane
    }
  })
}

function clusterEvents(events, bucketSize) {
  const grouped = new Map()

  events.forEach((event) => {
    const bucket = Math.floor((event.startValue || 0) / bucketSize) * bucketSize
    const key = `${event.track}-${bucket}`

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: `cluster-${key}`,
        cluster: true,
        track: event.track,
        trackLabel: event.trackLabel,
        formCategory: event.formCategory,
        accent: event.accent,
        wash: event.wash,
        border: event.border,
        startValue: bucket,
        endValue: bucket + bucketSize,
        title: `${event.trackLabel} cluster`,
        items: []
      })
    }

    grouped.get(key).items.push(event)
  })

  return Array.from(grouped.values()).map((group) => ({
    ...group,
    title: group.items.length === 1 ? group.items[0].title : `${group.items.length} events`,
    description: group.items.length === 1 ? group.items[0].description : `${group.trackLabel} events in the same time slice`
  }))
}

function histogram(events, range, bucketSize = 10) {
  const bucketCount = Math.max(Math.ceil(range.span / bucketSize), 1)
  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    year: range.min + index * bucketSize,
    personal: 0,
    local: 0,
    world: 0
  }))

  events.forEach((event) => {
    const rawIndex = Math.floor(((event.startValue || range.min) - range.min) / bucketSize)
    const index = Math.max(0, Math.min(rawIndex, buckets.length - 1))
    buckets[index][event.track] += 1
  })

  return buckets
}

function CreateEventForm({ timeline, category, onClose }) {
  const { data, setData, post, processing, errors } = useForm({
    event: {
      title: '',
      description: '',
      category,
      timeline_id: timeline.id,
      start_date_attributes: {
        date_type: 'exact',
        year: '',
        month: '',
        day: ''
      },
      end_date_attributes: {
        date_type: 'exact',
        year: '',
        month: '',
        day: ''
      }
    }
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    post('/events', {
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
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Add Event</p>
              <h2
                className="mt-2 text-3xl text-stone-900"
                style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
              >
                {`Create New Event (${category})`}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-stone-600 transition hover:bg-white"
            >
              Close
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Title</span>
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
              <span className="mb-2 block text-sm font-medium text-stone-700">Description</span>
              <textarea
                value={data.event.description}
                onChange={(event) => setData('event.description', event.target.value)}
                className="h-full min-h-36 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
                rows="6"
              />
            </label>

            <DateFields
              title="Start Date *"
              path="event.start_date_attributes"
              data={data.event.start_date_attributes}
              setData={setData}
            />

            <DateFields
              title="End Date"
              path="event.end_date_attributes"
              data={data.event.end_date_attributes}
              setData={setData}
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={processing}
              className="rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? 'Creating...' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 transition hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DateFields({ title, path, data, setData }) {
  return (
    <fieldset className="rounded-[24px] border border-stone-200 bg-white/70 p-5">
      <legend className="px-2 text-sm font-medium text-stone-700">{title}</legend>
      <div className="grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm text-stone-600">Date Type</span>
          <select
            value={data.date_type}
            onChange={(event) => setData(`${path}.date_type`, event.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
          >
            {DATE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="mb-2 block text-sm text-stone-600">Year</span>
            <input
              type="number"
              value={data.year}
              onChange={(event) => setData(`${path}.year`, event.target.value)}
              placeholder="YYYY"
              min="1"
              max="9999"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-stone-600">Month</span>
            <input
              type="number"
              value={data.month}
              onChange={(event) => setData(`${path}.month`, event.target.value)}
              placeholder="MM"
              min="1"
              max="12"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-stone-500 focus:ring-0"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-stone-600">Day</span>
            <input
              type="number"
              value={data.day}
              onChange={(event) => setData(`${path}.day`, event.target.value)}
              placeholder="DD"
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

function PrototypePicker({ activePrototype, onSelect }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {PROTOTYPES.map((prototype) => {
        const isActive = activePrototype === prototype.id

        return (
          <button
            key={prototype.id}
            type="button"
            onClick={() => onSelect(prototype.id)}
            className={`rounded-[28px] border p-6 text-left transition ${
              isActive
                ? 'border-stone-900 bg-stone-900 text-white shadow-xl'
                : 'border-stone-200 bg-white/80 text-stone-900 hover:-translate-y-0.5 hover:bg-white'
            }`}
          >
            <p className={`text-xs uppercase tracking-[0.28em] ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
              {prototype.eyebrow}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <h3
                className="text-2xl"
                style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
              >
                {prototype.name}
              </h3>
              <span className={`h-3 w-3 rounded-full ${isActive ? 'bg-[#d6c5a2]' : 'bg-stone-300'}`} />
            </div>
            <p className={`mt-4 text-sm leading-6 ${isActive ? 'text-stone-200' : 'text-stone-600'}`}>
              {prototype.title}
            </p>
            <p className={`mt-4 text-sm leading-6 ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
              {prototype.description}
            </p>
          </button>
        )
      })}
    </section>
  )
}

function TrackLegend({ canEdit, onAddEvent }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {TRACKS.map((track) => (
        <div
          key={track.key}
          className="flex items-center justify-between rounded-full border border-stone-200 bg-white/75 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: track.accent }}
            />
            <span className="text-sm font-medium text-stone-800">{track.label}</span>
          </div>
          {canEdit && (
            <button
              type="button"
              title={`Add ${track.label} event`}
              onClick={() => onAddEvent(track.formCategory)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 text-lg text-stone-700 transition hover:bg-stone-100"
            >
              +
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function Inspector({ selectedEvent }) {
  if (!selectedEvent) {
    return (
      <aside className="rounded-[32px] border border-stone-200 bg-white/80 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Inspector</p>
        <h3
          className="mt-4 text-2xl text-stone-900"
          style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
        >
          Select an event
        </h3>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          The chosen event opens here with its date range and description. This keeps the canvas clean while making exploration feel deliberate.
        </p>
      </aside>
    )
  }

  return (
    <aside className="rounded-[32px] border border-stone-200 bg-white/80 p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">{selectedEvent.trackLabel}</p>
      <h3
        className="mt-4 text-2xl text-stone-900"
        style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
      >
        {selectedEvent.title}
      </h3>
      <p className="mt-3 text-sm text-stone-500">{formatRangeLabel(selectedEvent)}</p>
      {selectedEvent.description ? (
        <p className="mt-5 text-sm leading-7 text-stone-700">{selectedEvent.description}</p>
      ) : (
        <p className="mt-5 text-sm leading-7 text-stone-500">No description was provided for this event.</p>
      )}
    </aside>
  )
}

function RibbonPrototype({ events, range, zoom, selectedEventId, onSelect }) {
  const condensed = zoom <= 35
  const bucketSize = zoom <= 20 ? 10 : zoom <= 35 ? 5 : 1
  const renderedEvents = condensed ? clusterEvents(events, bucketSize) : events
  const byTrack = TRACKS.map((track) => {
    const trackEvents = renderedEvents.filter((event) => event.track === track.key)
    const laidOutEvents = assignLanes(trackEvents)
    return {
      ...track,
      events: laidOutEvents,
      laneCount: Math.max(...laidOutEvents.map((event) => event.lane || 0), 0) + 1
    }
  })
  const density = histogram(events, range, 5)

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-[34px] border border-stone-200 bg-[linear-gradient(180deg,#fffefb_0%,#f7f1e8_100%)] p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 border-b border-stone-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Prototype One</p>
            <h2
              className="mt-2 text-3xl text-stone-900"
              style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
            >
              Ribbon
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-stone-600">
            Continuous horizontal reading. Events spread into sub-lanes when dates collide, and they collapse into clusters when the scale widens.
          </p>
        </div>

        <div className="space-y-5 overflow-x-auto pb-2">
          <div
            className="relative min-w-[900px] rounded-[28px] border border-stone-200 bg-white/80 p-6"
            style={{ width: `${Math.max(range.span * zoom * 10, 900)}px` }}
          >
            <Axis range={range} zoom={zoom} />
            <div className="mt-10 space-y-8">
              {byTrack.map((track) => (
                <div key={track.key}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: track.accent }} />
                    <span className="text-sm font-medium uppercase tracking-[0.2em] text-stone-600">{track.label}</span>
                  </div>
                  <div
                    className="relative rounded-[22px] border px-4 py-4"
                    style={{
                      minHeight: `${Math.max(track.laneCount, 1) * 76 + 12}px`,
                      backgroundColor: track.wash,
                      borderColor: track.border
                    }}
                  >
                    <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-stone-300" />
                    {track.events.map((event) => {
                      const left = `${(((event.startValue || range.min) - range.min) / range.span) * 100}%`
                      const width = condensed
                        ? `${Math.max(((event.endValue - event.startValue) / range.span) * 100, 8)}%`
                        : `${Math.max((((event.endValue || event.startValue) - (event.startValue || range.min) + 0.35) / range.span) * 100, 2.2)}%`
                      const isSelected = selectedEventId === event.id

                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => onSelect(event.cluster ? event.items[0] : event)}
                          className={`absolute rounded-[18px] border px-3 py-2 text-left transition ${
                            isSelected ? 'shadow-lg ring-2 ring-stone-900/15' : 'hover:-translate-y-0.5 hover:shadow-md'
                          }`}
                          style={{
                            left,
                            top: `${12 + (event.lane || 0) * 76}px`,
                            width,
                            backgroundColor: event.cluster ? event.accent : '#fffdf8',
                            color: event.cluster ? '#ffffff' : '#1c1917',
                            borderColor: event.cluster ? 'transparent' : event.border
                          }}
                        >
                          <div className="truncate text-sm font-medium">
                            {event.title}
                          </div>
                          <div className={`mt-1 text-xs ${event.cluster ? 'text-white/80' : 'text-stone-500'}`}>
                            {event.cluster ? `${event.items.length} overlapping entries` : formatRangeLabel(event)}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-stone-200 bg-white/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Mini Map</p>
              <p className="text-xs text-stone-500">Decade density</p>
            </div>
            <div className="flex items-end gap-2 overflow-hidden">
              {density.map((bucket) => {
                const total = bucket.personal + bucket.local + bucket.world
                const height = Math.max(total * 8, 8)
                return (
                  <button
                    key={bucket.year}
                    type="button"
                    onClick={() => {
                      const match = events.find((event) => (event.startValue || range.min) >= bucket.year && (event.startValue || range.min) < bucket.year + 5)
                      if (match) onSelect(match)
                    }}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                    title={`${bucket.year}s`}
                  >
                    <div
                      className="w-full rounded-full bg-stone-900/75"
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-[10px] tracking-[0.16em] text-stone-500">{bucket.year}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <Inspector selectedEvent={selectedEventId ? events.find((event) => event.id === selectedEventId) : null} />
    </section>
  )
}

function Axis({ range, zoom }) {
  const step = zoom >= 55 ? 2 : zoom >= 35 ? 5 : 10
  const marks = []

  for (let year = range.min; year <= range.max; year += step) {
    marks.push(year)
  }

  return (
    <div className="relative h-8 border-b border-stone-200">
      {marks.map((year) => (
        <div
          key={year}
          className="absolute top-0 h-full border-l border-stone-200"
          style={{ left: `${((year - range.min) / range.span) * 100}%` }}
        >
          <span className="absolute -left-4 -top-5 text-[10px] uppercase tracking-[0.18em] text-stone-500">
            {year}
          </span>
        </div>
      ))}
    </div>
  )
}

function StrataPrototype({ events, zoom, selectedEventId, onSelect }) {
  const bucketSize = zoom >= 55 ? 1 : zoom >= 35 ? 5 : 10
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
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-[34px] border border-stone-200 bg-white/80 p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 border-b border-stone-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Prototype Two</p>
            <h2
              className="mt-2 text-3xl text-stone-900"
              style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
            >
              Strata
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-stone-600">
            The page behaves like a printed chronicle. Dense periods collapse into compact clusters, but each layer stays visually separate.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.label} className="grid gap-4 rounded-[28px] border border-stone-200 bg-[#faf7f1] p-5 lg:grid-cols-[120px_repeat(3,minmax(0,1fr))]">
              <div className="pt-1">
                <div className="text-xs uppercase tracking-[0.28em] text-stone-500">Slice</div>
                <div
                  className="mt-2 text-2xl text-stone-900"
                  style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
                >
                  {section.label}
                </div>
              </div>
              {TRACKS.map((track) => (
                <div key={track.key} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: track.accent }} />
                    <span className="text-xs uppercase tracking-[0.18em] text-stone-500">{track.label}</span>
                  </div>
                  {section[track.key].length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-stone-200 px-4 py-5 text-sm text-stone-400">
                      Quiet period
                    </div>
                  ) : (
                    section[track.key].map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => onSelect(event)}
                        className={`block w-full rounded-[20px] border px-4 py-4 text-left transition ${
                          selectedEventId === event.id ? 'bg-stone-900 text-white shadow-lg' : 'bg-white hover:-translate-y-0.5 hover:shadow-md'
                        }`}
                        style={{
                          borderColor: selectedEventId === event.id ? 'transparent' : event.border
                        }}
                      >
                        <div className="text-sm font-medium">{event.title}</div>
                        <div className={`mt-2 text-xs ${selectedEventId === event.id ? 'text-stone-300' : 'text-stone-500'}`}>
                          {formatRangeLabel(event)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Inspector selectedEvent={selectedEventId ? events.find((event) => event.id === selectedEventId) : null} />
    </section>
  )
}

function PulsePrototype({ events, range, zoom, selectedEventId, onSelect }) {
  const bucketSize = zoom >= 55 ? 2 : zoom >= 35 ? 5 : 10
  const grouped = new Map()

  events.forEach((event) => {
    const bucket = Math.floor((event.startValue || range.min) / bucketSize) * bucketSize
    if (!grouped.has(bucket)) grouped.set(bucket, [])
    grouped.get(bucket).push(event)
  })

  const buckets = Array.from(grouped.entries()).sort((a, b) => a[0] - b[0])
  const activeBucket = selectedEventId
    ? Math.floor(((events.find((event) => event.id === selectedEventId)?.startValue || range.min) / bucketSize)) * bucketSize
    : buckets[0]?.[0]

  return (
    <section className="space-y-6 rounded-[34px] border border-stone-200 bg-[linear-gradient(180deg,#1d1a17_0%,#2a251f_100%)] p-5 text-white sm:p-7">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Prototype Three</p>
          <h2
            className="mt-2 text-3xl"
            style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
          >
            Pulse
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-stone-300">
          A compressed overview for long lifespans. Each segment acts like a pulse of activity and opens the selected time band beneath it.
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
                isActive ? 'border-[#d6c5a2] bg-[#d6c5a2] text-stone-900' : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className={`text-xs uppercase tracking-[0.2em] ${isActive ? 'text-stone-700' : 'text-stone-400'}`}>
                {bucketSize === 2 ? `${bucket}-${bucket + 1}` : `${bucket}-${bucket + bucketSize - 1}`}
              </div>
              <div className="mt-8 text-3xl">{bucketEvents.length}</div>
              <div className={`mt-1 text-xs ${isActive ? 'text-stone-700' : 'text-stone-400'}`}>events</div>
            </button>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Expanded Slice</p>
            <p className="text-xs text-stone-400">
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
                  selectedEventId === event.id ? 'border-transparent bg-white text-stone-900 shadow-lg' : 'border-white/10 bg-white/6 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: event.accent }} />
                  <span className={`text-xs uppercase tracking-[0.18em] ${selectedEventId === event.id ? 'text-stone-500' : 'text-stone-400'}`}>
                    {event.trackLabel}
                  </span>
                </div>
                <div className="mt-4 text-sm font-medium">{event.title}</div>
                <div className={`mt-2 text-xs ${selectedEventId === event.id ? 'text-stone-500' : 'text-stone-400'}`}>
                  {formatRangeLabel(event)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Direction</p>
          <h3
            className="mt-4 text-2xl"
            style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
          >
            Best for very long lives or crowded archives
          </h3>
          <p className="mt-4 text-sm leading-7 text-stone-300">
            This version gives the strongest overview, but it abstracts individual chronology more aggressively. It is useful as a secondary navigation mode, not as the primary storytelling surface.
          </p>
          {selectedEventId && (
            <div className="mt-6 rounded-[24px] bg-white px-5 py-4 text-stone-900">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Selected Event</p>
              <p className="mt-3 text-lg">{events.find((event) => event.id === selectedEventId)?.title}</p>
              <p className="mt-2 text-sm text-stone-500">{formatRangeLabel(events.find((event) => event.id === selectedEventId))}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Show({ timeline, can_edit, can_delete, current_user, flash }) {
  const [prototype, setPrototype] = useState('ribbon')
  const [zoom, setZoom] = useState(48)
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newEventCategory, setNewEventCategory] = useState(null)

  const events = useMemo(() => normalizeTimelineEvents(timeline.categorized_events), [timeline.categorized_events])
  const range = useMemo(() => computeRange(events), [events])
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) || events[0] || null,
    [events, selectedEventId]
  )

  const openCreateForm = (category) => {
    setNewEventCategory(category)
    setShowCreateForm(true)
  }

  const handleDeleteEvent = (eventId, category) => {
    if (!window.confirm('Remove this event from the timeline?')) return

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

  const renderPrototype = () => {
    if (events.length === 0) {
      return (
        <div className="rounded-[34px] border border-dashed border-stone-300 bg-white/70 px-8 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Empty Timeline</p>
          <h2
            className="mt-4 text-3xl text-stone-900"
            style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
          >
            No events available yet
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-600">
            The new timeline surface is ready. Once personal, local, or global events are attached, this page will open as an interactive historical canvas.
          </p>
        </div>
      )
    }

    switch (prototype) {
      case 'strata':
        return (
          <StrataPrototype
            events={events}
            zoom={zoom}
            selectedEventId={selectedEvent?.id}
            onSelect={(event) => setSelectedEventId(event.id)}
          />
        )
      case 'pulse':
        return (
          <PulsePrototype
            events={events}
            range={range}
            zoom={zoom}
            selectedEventId={selectedEvent?.id}
            onSelect={(event) => setSelectedEventId(event.id)}
          />
        )
      default:
        return (
          <RibbonPrototype
            events={events}
            range={range}
            zoom={zoom}
            selectedEventId={selectedEvent?.id}
            onSelect={(event) => setSelectedEventId(event.id)}
          />
        )
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={timeline.title} />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f1ebe1_0%,#f7f3ec_30%,#f5f1ea_100%)]">
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-[40px] border border-stone-200 bg-white/70 p-6 shadow-[0_20px_80px_rgba(28,25,23,0.08)] backdrop-blur sm:p-8">
            <div className="flex flex-col gap-8 border-b border-stone-200 pb-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl">
                <p className="text-xs uppercase tracking-[0.36em] text-stone-500">Timeline Show</p>
                <h1
                  className="mt-4 text-5xl leading-none text-stone-900 sm:text-6xl"
                  style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
                >
                  {timeline.title}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-stone-600">
                  <span className="rounded-full border border-stone-200 bg-white/80 px-4 py-2">{timeline.person_name}</span>
                  <span className="rounded-full border border-stone-200 bg-white/80 px-4 py-2">
                    {range.min}-{range.max}
                  </span>
                  <span className="rounded-full border border-stone-200 bg-white/80 px-4 py-2">
                    {events.length} events
                  </span>
                </div>
                <p className="mt-6 max-w-2xl text-base leading-7 text-stone-600">
                  Three directions for the main timeline page. The first one should be the production candidate: it keeps the whole life visible, stays calm under density, and invites interaction.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/timelines"
                  className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-white"
                >
                  Back to Timelines
                </Link>
                {can_edit && (
                  <Link
                    href={`/timelines/${timeline.id}/edit`}
                    className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-white"
                  >
                    Edit
                  </Link>
                )}
                {can_edit && (
                  <button
                    type="button"
                    onClick={() => router.post(`/timelines/${timeline.id}/export_pdf`)}
                    className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                  >
                    Generate PDF
                  </button>
                )}
                {timeline.pdf_url && (
                  <Link
                    href={`/timelines/${timeline.id}/download_pdf`}
                    className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-white"
                  >
                    Download PDF
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-8">
              <PrototypePicker activePrototype={prototype} onSelect={setPrototype} />

              <section className="grid gap-4 rounded-[30px] border border-stone-200 bg-[#f8f4ee] p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Scale</p>
                  <div className="mt-3 flex items-center gap-4">
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={zoom}
                      onChange={(event) => setZoom(Number(event.target.value))}
                      className="w-full accent-stone-900"
                    />
                    <span className="w-12 text-right text-sm text-stone-600">{zoom}</span>
                  </div>
                </div>
                <TrackLegend canEdit={can_edit} onAddEvent={openCreateForm} />
              </section>

              {renderPrototype()}

              {selectedEvent && can_edit && (
                <section className="rounded-[30px] border border-stone-200 bg-white/80 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Selected Event</p>
                      <h3
                        className="mt-2 text-2xl text-stone-900"
                        style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", serif' }}
                      >
                        {selectedEvent.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      title="Remove from timeline"
                      onClick={() => handleDeleteEvent(selectedEvent.id, selectedEvent.formCategory)}
                      className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100"
                    >
                      Remove from timeline
                    </button>
                  </div>
                </section>
              )}
            </div>
          </section>
        </div>
      </div>

      {showCreateForm && (
        <CreateEventForm
          timeline={timeline}
          category={newEventCategory}
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </Layout>
  )
}
