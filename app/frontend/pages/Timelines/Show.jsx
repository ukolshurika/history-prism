import { Head, Link, useForm, router } from '@inertiajs/react'
import Layout from '../Layout'
import { useMemo, useState } from 'react'

function CreateEventForm({ timeline, category, onClose }) {
  const { data, setData, post, processing, errors } = useForm({
    event: {
      title: '',
      description: '',
      category: category,
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

  const handleSubmit = (e) => {
    e.preventDefault()
    post('/events', {
      preserveScroll: true,
      onSuccess: () => {
        onClose()
      }
    })
  }

  const dateTypes = [
    { value: 'exact', label: 'Exact' },
    { value: 'about', label: 'About' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'estimated', label: 'Estimated' },
    { value: 'calculated', label: 'Calculated' },
    { value: 'year', label: 'Year Only' },
    { value: 'month_year', label: 'Month/Year' }
  ]

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Create New Event ({category})
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {errors && Object.keys(errors).length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              {Object.values(errors).map((error, index) => (
                <p key={index} className="text-red-600 text-sm">{error}</p>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={data.event.title}
                onChange={(e) => setData('event.title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                value={data.event.description}
                onChange={(e) => setData('event.description', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Start Date */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Start Date *</h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Type
                  </label>
                  <select
                    value={data.event.start_date_attributes.date_type}
                    onChange={(e) => setData('event.start_date_attributes.date_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {dateTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year *
                    </label>
                    <input
                      type="number"
                      value={data.event.start_date_attributes.year}
                      onChange={(e) => setData('event.start_date_attributes.year', e.target.value)}
                      placeholder="YYYY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                      max="9999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <input
                      type="number"
                      value={data.event.start_date_attributes.month}
                      onChange={(e) => setData('event.start_date_attributes.month', e.target.value)}
                      placeholder="MM"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day
                    </label>
                    <input
                      type="number"
                      value={data.event.start_date_attributes.day}
                      onChange={(e) => setData('event.start_date_attributes.day', e.target.value)}
                      placeholder="DD"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="31"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* End Date */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">End Date (Optional)</h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Type
                  </label>
                  <select
                    value={data.event.end_date_attributes.date_type}
                    onChange={(e) => setData('event.end_date_attributes.date_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {dateTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      value={data.event.end_date_attributes.year}
                      onChange={(e) => setData('event.end_date_attributes.year', e.target.value)}
                      placeholder="YYYY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="9999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <input
                      type="number"
                      value={data.event.end_date_attributes.month}
                      onChange={(e) => setData('event.end_date_attributes.month', e.target.value)}
                      placeholder="MM"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day
                    </label>
                    <input
                      type="number"
                      value={data.event.end_date_attributes.day}
                      onChange={(e) => setData('event.end_date_attributes.day', e.target.value)}
                      placeholder="DD"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="31"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="submit"
              disabled={processing}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Creating...' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Show({ timeline, can_edit, can_delete, current_user, flash }) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newEventCategory, setNewEventCategory] = useState(null)
  const [activeEventIds, setActiveEventIds] = useState({})
  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const formatEventDate = (year, month, day, dateText) => {
    if (dateText) return dateText
    if (!year) return 'N/A'
    if (!month) return year.toString()
    if (!day) return `${year}-${month.toString().padStart(2, '0')}`
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  // Get categorized events
  const { personal, local, world } = timeline.categorized_events || { personal: [], local: [], world: [] }

  // Calculate year range for the timeline (vertical)
  const { minYear, maxYear, yearRange } = useMemo(() => {
    const allEvents = [...personal, ...local, ...world]
    if (allEvents.length === 0) return { minYear: 0, maxYear: 0, yearRange: [] }

    const years = allEvents.flatMap(e => [e.start_year, e.end_year]).filter(y => y)
    const min = Math.min(...years)
    const max = Math.max(...years)

    // Full year range for vertical positioning
    const range = []
    for (let year = min; year <= max; year++) {
      range.push(year)
    }

    return { minYear: min, maxYear: max, yearRange: range }
  }, [personal, local, world])

  // Calculate vertical position for each event based on its year
  const YEAR_HEIGHT = 80 // pixels per year

  const getYearPosition = (year) => {
    if (!year || yearRange.length === 0) return 0
    const index = yearRange.indexOf(year)
    return index * YEAR_HEIGHT
  }

  // Calculate height for multi-year events
  const getEventHeight = (startYear, endYear) => {
    if (!startYear || !endYear || startYear === endYear) return null
    const startIndex = yearRange.indexOf(startYear)
    const endIndex = yearRange.indexOf(endYear)
    return (endIndex - startIndex) * YEAR_HEIGHT
  }

  // Group events by year for each track to handle overlaps
  const groupEventsByYear = (events) => {
    const grouped = {}
    events.forEach(event => {
      const year = event.start_year
      if (!grouped[year]) grouped[year] = []
      grouped[year].push(event)
    })
    return grouped
  }

  const openCreateForm = (category) => {
    setNewEventCategory(category)
    setShowCreateForm(true)
  }

  const handleDeleteEvent = (eventId, category, e) => {
    e.stopPropagation() // Prevent opening the event detail modal

    if (confirm('Remove this event from the timeline?')) {
      // Get current cached events
      const currentCache = timeline.cached_events_for_display || {}
      const categoryKey = category === 'person' ? 'person' : category

      // Remove the event ID from the category array
      const updatedEventIds = (currentCache[categoryKey] || []).filter(id => id !== eventId)

      // Create updated cache
      const updatedCache = {
        ...currentCache,
        [categoryKey]: updatedEventIds
      }

      // Send update request
      router.put(`/timelines/${timeline.id}`, {
        timeline: {
          cached_events_for_display: updatedCache
        }
      }, {
        preserveScroll: true
      })
    }
  }

  const getButtonClasses = (category) => {
    const baseClasses = "text-white w-7 h-7 rounded-full transition-colors flex items-center justify-center text-lg font-bold"

    switch(category) {
      case 'person':
        return `${baseClasses} bg-blue-500 hover:bg-blue-700`
      case 'local':
        return `${baseClasses} bg-green-500 hover:bg-green-700`
      case 'world':
        return `${baseClasses} bg-purple-500 hover:bg-purple-700`
      default:
        return `${baseClasses} bg-gray-500 hover:bg-gray-700`
    }
  }

  const renderVerticalTrack = (events, trackName, color, category) => {
    const groupedEvents = groupEventsByYear(events)

    const handleEventClick = (event, e) => {
      // Check if clicking on delete button
      if (e.target.closest('button[title="Remove from timeline"]')) {
        return
      }

      // Check if clicking on info icon
      if (e.target.closest('.event-info-icon')) {
        setSelectedEvent(event)
        return
      }

      // Bring event to front by setting its ID as active for this category
      setActiveEventIds(prev => ({
        ...prev,
        [`${category}-${event.start_year}`]: event.id
      }))
    }

    return (
      <div className="flex-1 min-w-0 px-2">
        <div className="flex items-center justify-center gap-2 sticky top-0 bg-white py-2 z-10 mb-4">
          <h3 className={`text-lg font-semibold ${color}`}>
            {trackName}
          </h3>
          {can_edit && (
            <button
              onClick={() => openCreateForm(category)}
              className={getButtonClasses(category)}
              title={`Add ${trackName} event`}
            >
              +
            </button>
          )}
        </div>
        <div className="relative border-l-2 border-gray-300">
          {events.length === 0 ? (
            <div className="text-sm text-gray-400 italic pl-4">No events</div>
          ) : (
            events.map((event) => {
              const topPosition = getYearPosition(event.start_year)
              const eventHeight = getEventHeight(event.start_year, event.end_year)
              const isMultiYear = event.is_multi_year

              // Count how many events are in the same year
              const sameYearEvents = groupedEvents[event.start_year] || []
              const eventIndex = sameYearEvents.indexOf(event)
              const totalEventsInYear = sameYearEvents.length

              // Check if this event is active (brought to front)
              const activeEventId = activeEventIds[`${category}-${event.start_year}`]
              const isActive = activeEventId === event.id

              // Calculate z-index: active events get highest, then reverse order
              let zIndex = 1
              if (isActive) {
                zIndex = 100
              } else if (activeEventId) {
                // If there's an active event but this isn't it, lower z-index
                zIndex = eventIndex
              } else {
                // Default: later events (higher index) on top
                zIndex = totalEventsInYear - eventIndex
              }

              return (
                <div
                  key={event.id}
                  className="absolute left-0 pl-4"
                  style={{
                    top: `${topPosition}px`,
                    width: 'calc(100% - 1rem)',
                    zIndex: zIndex
                  }}
                >
                  {/* Multi-year duration bar */}
                  {isMultiYear && eventHeight && (
                    <div
                      className={`absolute left-0 w-0.5 ${color.replace('text-', 'bg-').replace('-600', '-400')}`}
                      style={{ height: `${eventHeight}px` }}
                    ></div>
                  )}

                  {/* Event card */}
                  <div
                    onClick={(e) => handleEventClick(event, e)}
                    className={`bg-white border-l-4 ${color.replace('text-', 'border-')} rounded-r-lg p-2 shadow-sm hover:shadow-lg transition-all cursor-pointer mb-2 ${
                      isActive ? 'ring-2 ring-offset-1 ' + color.replace('text-', 'ring-') : ''
                    }`}
                    style={{
                      marginLeft: eventIndex > 0 ? `${eventIndex * 20}px` : '0'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-sm font-semibold text-gray-900 flex-1" title={event.title}>
                        {event.title}
                        {totalEventsInYear > 1 && (
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${color.replace('text-', 'bg-').replace('-600', '-100')} ${color.replace('-600', '-700')}`}>
                            {eventIndex + 1}/{totalEventsInYear}
                          </span>
                        )}
                      </div>
                      {can_edit && (
                        <button
                          onClick={(e) => handleDeleteEvent(event.id, category, e)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2 p-1"
                          title="Remove from timeline"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex items-start justify-between mt-1">
                      <div className="text-xs text-gray-600">
                        {formatEventDate(event.start_year, event.start_month, event.start_day, event.start_date_text)}
                        {isMultiYear && (
                          <>
                            <br />→ {formatEventDate(event.end_year, event.end_month, event.end_day, event.end_date_text)}
                          </>
                        )}
                      </div>
                      {event.description && (
                        <div
                          className="event-info-icon w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-xs text-gray-500 font-semibold flex-shrink-0 ml-2 hover:bg-gray-100"
                          title="View details"
                        >
                          i
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={timeline.title} />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {timeline.title}
                </h1>
                <p className="text-gray-600">
                  Person: {timeline.person_name || 'Unknown'}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/timelines"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Back to Timelines
                </Link>
                {can_edit && (
                  <>
                    <Link
                      href={`/timelines/${timeline.id}/edit`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => router.post(`/timelines/${timeline.id}/export_pdf`)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Generate PDF
                    </button>
                  </>
                )}
                {timeline.pdf_url && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`/timelines/${timeline.id}/download_pdf`}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Download PDF
                    </a>
                    {timeline.pdf_generated_at && (
                      <span className="text-sm text-gray-500">
                        Generated {new Date(timeline.pdf_generated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(timeline.start_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(timeline.end_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Visibility</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {timeline.visible ? (
                      <span className="text-green-600">Public</span>
                    ) : (
                      <span className="text-gray-600">Private</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(timeline.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Timeline Events
              </h2>

              {personal.length === 0 && local.length === 0 && world.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No events available yet. Events will appear after processing.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex gap-4" style={{ minHeight: `${yearRange.length * 80}px` }}>
                    {/* Year column */}
                    <div className="w-20 flex-shrink-0">
                      <div className="sticky top-0 bg-white py-2 z-20 mb-2 border-b border-gray-200">
                        <div className="text-sm font-semibold text-gray-700 text-center">Year</div>
                      </div>
                      <div className="relative" style={{ height: `${yearRange.length * 80}px` }}>
                        {yearRange.map((year, index) => (
                          <div
                            key={year}
                            className="absolute left-0 w-full text-center"
                            style={{ top: `${index * 80}px`, height: '80px' }}
                          >
                            <div className="text-sm font-semibold text-gray-700 border-t border-gray-300 pt-2">
                              {year}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline tracks */}
                    {renderVerticalTrack(personal, 'Personal', 'text-blue-600', 'person')}
                    {renderVerticalTrack(local, 'Local', 'text-green-600', 'local')}
                    {renderVerticalTrack(world, 'World', 'text-purple-600', 'world')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <CreateEventForm
          timeline={timeline}
          category={newEventCategory}
          onClose={() => {
            setShowCreateForm(false)
            setNewEventCategory(null)
          }}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedEvent.title}
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Date</h4>
                  <p className="text-gray-900">
                    {formatEventDate(
                      selectedEvent.start_year,
                      selectedEvent.start_month,
                      selectedEvent.start_day,
                      selectedEvent.start_date_text
                    )}
                    {selectedEvent.is_multi_year && (
                      <>
                        {' → '}
                        {formatEventDate(
                          selectedEvent.end_year,
                          selectedEvent.end_month,
                          selectedEvent.end_day,
                          selectedEvent.end_date_text
                        )}
                      </>
                    )}
                  </p>
                </div>

                {selectedEvent.category && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Category</h4>
                    <span className="inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 capitalize">
                      {selectedEvent.category}
                    </span>
                  </div>
                )}

                {selectedEvent.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
