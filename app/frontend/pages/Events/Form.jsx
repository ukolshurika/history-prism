import { Head, useForm, Link, usePage } from '@inertiajs/react'
import { useState } from 'react'
import Layout from '../Layout'
import YandexMapPicker from '../../components/YandexMapPicker'
import { useTranslations } from '../../lib/useTranslations'

const DATE_MODE_OPTIONS = ['single', 'about', 'year', 'range']
const DATE_TYPE_OPTIONS = ['exact', 'about', 'before', 'after', 'estimated', 'calculated', 'year', 'month_year']

function blankDateAttributes() {
  return {
    original_text: '',
    date_type: 'exact',
    year: '',
    month: '',
    day: '',
    calendar_type: 'gregorian',
  }
}

function hasDateValue(attrs = {}) {
  return Boolean(attrs?.year)
}

function inferDateTypeFromParts(month, day) {
  if (month && day) return 'exact'
  if (month) return 'month_year'
  return 'year'
}

function parseLegacyDateString(value) {
  if (!value || typeof value !== 'string') return blankDateAttributes()

  const exactMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (exactMatch) {
    return {
      ...blankDateAttributes(),
      date_type: 'exact',
      year: exactMatch[1],
      month: exactMatch[2],
      day: exactMatch[3],
    }
  }

  const monthYearMatch = value.match(/^(\d{4})-(\d{2})$/)
  if (monthYearMatch) {
    return {
      ...blankDateAttributes(),
      date_type: 'month_year',
      year: monthYearMatch[1],
      month: monthYearMatch[2],
    }
  }

  const yearMatch = value.match(/^(\d{4})$/)
  if (yearMatch) {
    return {
      ...blankDateAttributes(),
      date_type: 'year',
      year: yearMatch[1],
    }
  }

  return blankDateAttributes()
}

function normalizeDateAttributes(value) {
  if (!value) return blankDateAttributes()
  if (typeof value === 'string') return parseLegacyDateString(value)

  return {
    ...blankDateAttributes(),
    original_text: value.original_text || '',
    date_type: value.date_type || inferDateTypeFromParts(value.month, value.day),
    year: value.year ? String(value.year) : '',
    month: value.month ? String(value.month).padStart(2, '0') : '',
    day: value.day ? String(value.day).padStart(2, '0') : '',
    calendar_type: value.calendar_type || 'gregorian',
  }
}

function datesMatch(left, right) {
  return ['date_type', 'year', 'month', 'day', 'calendar_type'].every((key) => (left?.[key] || '') === (right?.[key] || ''))
}

function inferDateMode(startDate, endDate) {
  if (hasDateValue(endDate) && !datesMatch(startDate, endDate)) return 'range'
  if (startDate?.date_type === 'about') return 'about'
  if (startDate?.date_type === 'year') return 'year'
  return 'single'
}

function buildInitialEventState(event = {}) {
  const startDate = normalizeDateAttributes(event.start_date_attributes || event.start_date || event.start_date_display)
  const endSource = normalizeDateAttributes(event.end_date_attributes || event.end_date || event.end_date_display)
  const dateMode = inferDateMode(startDate, endSource)

  return {
    dateMode,
    event: {
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'person',
      person_ids: event.person_ids || [],
      start_date_attributes: startDate,
      end_date_attributes: dateMode === 'range' ? endSource : blankDateAttributes(),
      location_attributes: {
        id: event.location?.id || null,
        place: event.location?.place || '',
        latitude: event.location?.latitude || null,
        longitude: event.location?.longitude || null,
      },
    },
  }
}

function compareDateParts(left, right) {
  const leftValues = [Number(left.year), Number(left.month || 1), Number(left.day || 1)]
  const rightValues = [Number(right.year), Number(right.month || 1), Number(right.day || 1)]

  for (let index = 0; index < leftValues.length; index += 1) {
    if (leftValues[index] < rightValues[index]) return -1
    if (leftValues[index] > rightValues[index]) return 1
  }

  return 0
}

function validateDateAttributes(attrs, { required, label, t }) {
  const errors = []
  const dateType = attrs.date_type || 'exact'

  if (!attrs.year) {
    if (required) errors.push(t('events.form.validation.year_required', { field: label }))
    return errors
  }

  if (attrs.day && !attrs.month) {
    errors.push(t('events.form.validation.day_requires_month', { field: label }))
  }

  if (dateType === 'month_year' && !attrs.month) {
    errors.push(t('events.form.validation.month_required', { field: label }))
  }

  if (dateType === 'exact') {
    if (!attrs.month) {
      errors.push(t('events.form.validation.month_required', { field: label }))
    }

    if (!attrs.day) {
      errors.push(t('events.form.validation.day_required', { field: label }))
    }
  }

  return errors
}

function validateEventDates(eventData, dateMode, t) {
  const errors = [
    ...validateDateAttributes(eventData.start_date_attributes, {
      required: true,
      label: t('events.form.start_date'),
      t,
    }),
  ]

  if (dateMode !== 'range') return errors

  errors.push(
    ...validateDateAttributes(eventData.end_date_attributes, {
      required: true,
      label: t('events.form.end_date'),
      t,
    })
  )

  if (
    hasDateValue(eventData.start_date_attributes) &&
    hasDateValue(eventData.end_date_attributes) &&
    compareDateParts(eventData.end_date_attributes, eventData.start_date_attributes) < 0
  ) {
    errors.push(t('events.form.validation.end_before_start'))
  }

  return errors
}

function DateFields({ title, path, data, setData, setDateMode, t, showDateType = true }) {
  const showsMonth = data.date_type !== 'year'
  const showsDay = !['year', 'month_year'].includes(data.date_type)

  const handleDateTypeChange = (nextType) => {
    setData(`${path}.date_type`, nextType)

    if (path === 'event.start_date_attributes' && setDateMode) {
      if (nextType === 'year') {
        setDateMode('year')
      } else if (nextType === 'about') {
        setDateMode('about')
      } else {
        setDateMode('single')
      }
    }

    if (nextType === 'year') {
      setData(`${path}.month`, '')
      setData(`${path}.day`, '')
    } else if (nextType === 'month_year') {
      setData(`${path}.day`, '')
    }
  }

  return (
    <fieldset className="rounded-md border border-gray-200 p-4">
      <legend className="px-2 text-sm font-medium text-gray-700">{title}</legend>

      <div className="grid gap-4 sm:grid-cols-2">
        {showDateType && (
          <div className="sm:col-span-2">
            <label htmlFor={`${path}-date-type`} className="block text-sm font-medium text-gray-700 mb-1">
              {t('events.form.date_type')}
            </label>
            <select
              id={`${path}-date-type`}
              value={data.date_type}
              onChange={(e) => handleDateTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DATE_TYPE_OPTIONS.map((dateType) => (
                <option key={dateType} value={dateType}>
                  {t(`events.form.date_types.${dateType}`)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor={`${path}-year`} className="block text-sm font-medium text-gray-700 mb-1">
            {t('events.form.year')}
          </label>
          <input
            type="number"
            id={`${path}-year`}
            value={data.year}
            onChange={(e) => setData(`${path}.year`, e.target.value)}
            min="1"
            max="9999"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {showsMonth && (
          <div>
            <label htmlFor={`${path}-month`} className="block text-sm font-medium text-gray-700 mb-1">
              {t('events.form.month')}
            </label>
            <input
              type="number"
              id={`${path}-month`}
              value={data.month}
              onChange={(e) => setData(`${path}.month`, e.target.value)}
              min="1"
              max="12"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {showsDay && (
          <div>
            <label htmlFor={`${path}-day`} className="block text-sm font-medium text-gray-700 mb-1">
              {t('events.form.day')}
            </label>
            <input
              type="number"
              id={`${path}-day`}
              value={data.day}
              onChange={(e) => setData(`${path}.day`, e.target.value)}
              min="1"
              max="31"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </fieldset>
  )
}

export default function Form({ event, categories, people = [], isEdit, current_user, flash, errors = [] }) {
  const { yandex_maps_api_key } = usePage().props
  const t = useTranslations()
  const initialState = buildInitialEventState(event)
  const [dateMode, setDateMode] = useState(initialState.dateMode)
  const [clientErrors, setClientErrors] = useState([])
  const { data, setData, post, put, processing } = useForm({ event: initialState.event })

  const visibleErrors = [...new Set([...clientErrors, ...errors])]

  const applyDateMode = (nextMode) => {
    setDateMode(nextMode)
    setClientErrors([])

    if (nextMode === 'range') {
      setData('event.start_date_attributes.date_type', 'exact')
      setData('event.end_date_attributes', {
        ...blankDateAttributes(),
        date_type: 'exact',
      })
      return
    }

    setData('event.end_date_attributes', blankDateAttributes())

    if (nextMode === 'about') {
      setData('event.start_date_attributes.date_type', 'about')
      return
    }

    if (nextMode === 'year') {
      setData('event.start_date_attributes.date_type', 'year')
      setData('event.start_date_attributes.month', '')
      setData('event.start_date_attributes.day', '')
      return
    }

    if (data.event.start_date_attributes.date_type === 'year') {
      setData('event.start_date_attributes.month', '')
      setData('event.start_date_attributes.day', '')
    }

    if (!['exact', 'month_year', 'before', 'after', 'estimated', 'calculated'].includes(data.event.start_date_attributes.date_type)) {
      setData('event.start_date_attributes.date_type', 'exact')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateEventDates(data.event, dateMode, t)

    if (validationErrors.length > 0) {
      setClientErrors(validationErrors)
      return
    }

    setClientErrors([])

    if (isEdit) {
      put(`/events/${event.id}`)
    } else {
      post('/events')
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={isEdit ? t('events.form.edit_title') : t('events.form.new_title')} />

      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/events"
              className="text-blue-600 hover:text-blue-700"
            >
              &larr; {t('events.form.back')}
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-6">
              {isEdit ? t('events.form.edit_title') : t('events.form.new_title')}
            </h1>

            {visibleErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                {visibleErrors.map((error, index) => (
                  <p key={index} className="text-red-600 text-sm">{error}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('events.form.title')}
                </label>
                <input
                  type="text"
                  id="title"
                  name="event[title]"
                  value={data.event.title}
                  onChange={(e) => setData('event.title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('events.form.description')}
                </label>
                <textarea
                  id="description"
                  name="event[description]"
                  value={data.event.description}
                  onChange={(e) => setData('event.description', e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('events.form.category')}
                </label>
                <select
                  id="category"
                  name="event[category]"
                  value={data.event.category}
                  onChange={(e) => {
                    const newCategory = e.target.value
                    setData('event.category', newCategory)
                    // Clear person_ids when switching away from person category
                    if (newCategory !== 'person') {
                      setData('event.person_ids', [])
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`events.categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="date_mode" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('events.form.date_mode')}
                </label>
                <select
                  id="date_mode"
                  value={dateMode}
                  onChange={(e) => applyDateMode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DATE_MODE_OPTIONS.map((mode) => (
                    <option key={mode} value={mode}>
                      {t(`events.form.date_modes.${mode}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`grid gap-4 mb-4 ${dateMode === 'range' ? 'lg:grid-cols-2' : ''}`}>
                <DateFields
                  title={dateMode === 'range' ? t('events.form.start_date') : t('events.form.start_date_required')}
                  path="event.start_date_attributes"
                  data={data.event.start_date_attributes}
                  setData={setData}
                  setDateMode={setDateMode}
                  t={t}
                  showDateType={dateMode !== 'range'}
                />

                {dateMode === 'range' && (
                  <DateFields
                    title={t('events.form.end_date')}
                    path="event.end_date_attributes"
                    data={data.event.end_date_attributes}
                    setData={setData}
                    t={t}
                    showDateType={false}
                  />
                )}
              </div>

              {data.event.category === 'person' && (
                <div className="mb-4">
                  <label htmlFor="people" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('events.form.associated_people')}
                  </label>
                  <select
                    id="people"
                    name="event[person_ids][]"
                    multiple
                    value={data.event.person_ids}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                      setData('event.person_ids', selected)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  >
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.full_name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {t('events.form.associated_people_hint')}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('events.form.location')}
                </label>
                <YandexMapPicker
                  lat={data.event.location_attributes.latitude}
                  lng={data.event.location_attributes.longitude}
                  address={data.event.location_attributes.place}
                  apiKey={yandex_maps_api_key}
                  disabled={processing}
                  onChange={(lat, lng, address) =>
                    setData('event.location_attributes', {
                      ...data.event.location_attributes,
                      latitude: lat,
                      longitude: lng,
                      place: address,
                    })
                  }
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing
                    ? (isEdit ? t('events.form.updating') : t('events.form.creating'))
                    : (isEdit ? t('events.form.update') : t('events.form.create'))}
                </button>
                <Link
                  href="/events"
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 text-center"
                >
                  {t('events.form.cancel')}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
