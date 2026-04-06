import { Head, useForm, Link, usePage } from '@inertiajs/react'
import Layout from '../Layout'
import YandexMapPicker from '../../components/YandexMapPicker'
import { useTranslations } from '../../lib/useTranslations'

function padDatePart(value) {
  return String(value).padStart(2, '0')
}

function dateValueFromAttributes(attrs = {}) {
  if (!attrs?.year) return ''

  const month = attrs.month ? padDatePart(attrs.month) : '01'
  const day = attrs.day ? padDatePart(attrs.day) : '01'
  return `${attrs.year}-${month}-${day}`
}

function normalizeDateValue(value, fallbackAttributes = null) {
  if (!value && fallbackAttributes) return dateValueFromAttributes(fallbackAttributes)
  if (!value) return ''

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value

    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10)
  }

  if (typeof value === 'object') {
    if (value.original_text && /^\d{4}-\d{2}-\d{2}$/.test(value.original_text)) return value.original_text
    if (value.year) return dateValueFromAttributes(value)
  }

  return ''
}

export default function Form({ event, categories, people = [], isEdit, current_user, flash, errors = [] }) {
  const { yandex_maps_api_key } = usePage().props
  const t = useTranslations()
  const { data, setData, post, put, processing } = useForm({
    event: {
      title: event.title || '',
      description: event.description || '',
      start_date: normalizeDateValue(event.start_date || event.start_date_display, event.start_date_attributes),
      end_date: normalizeDateValue(event.end_date || event.end_date_display, event.end_date_attributes),
      category: event.category || 'person',
      person_ids: event.person_ids || [],
      location_attributes: {
        id: event.location?.id || null,
        place: event.location?.place || '',
        latitude: event.location?.latitude || null,
        longitude: event.location?.longitude || null,
      },
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
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

            {errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                {errors.map((error, index) => (
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

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('events.form.start_date')}
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="event[start_date]"
                    value={data.event.start_date || ''}
                    onChange={(e) => setData('event.start_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('events.form.end_date')}
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="event[end_date]"
                    value={data.event.end_date || ''}
                    onChange={(e) => setData('event.end_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
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
