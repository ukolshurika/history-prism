import { Head, Link } from '@inertiajs/react'
import Layout from '../Layout'

export default function Show({ timeline, can_edit, can_delete, current_user, flash }) {
  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const formatDateTime = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString()
  }

  const events = timeline.cached_events_for_display?.events || []

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
                  <Link
                    href={`/timelines/${timeline.id}/edit`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </Link>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Timeline Events
              </h2>

              {events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No events available yet. Events will appear after processing.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {event.name || 'Unnamed Event'}
                          </h3>
                          {event.description && (
                            <p className="text-gray-600 mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 text-right">
                          {event.begin && (
                            <p>Start: {formatDateTime(event.begin)}</p>
                          )}
                          {event.end && (
                            <p>End: {formatDateTime(event.end)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
