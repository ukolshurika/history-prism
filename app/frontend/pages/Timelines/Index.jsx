import { Head, Link, router } from '@inertiajs/react'
import Layout from '../Layout'
import { useState } from 'react'

export default function Index({ timelines, current_user, flash }) {
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = (timelineId) => {
    if (confirm('Are you sure you want to delete this timeline?')) {
      setDeletingId(timelineId)
      router.delete(`/timelines/${timelineId}`, {
        onFinish: () => setDeletingId(null),
      })
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title="Timelines" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Timelines</h1>
            {current_user && (
              <Link
                href="/timelines/new"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Timeline
              </Link>
            )}
          </div>

          {timelines.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 mb-4">No timelines created yet.</p>
              {current_user && (
                <p className="text-sm text-gray-400">
                  Create your first timeline to visualize life events.
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {timelines.map((timeline) => (
                <div
                  key={timeline.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {timeline.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      Person: {timeline.person_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Period: {formatDate(timeline.start_at)} - {formatDate(timeline.end_at)}
                    </p>
                    {timeline.visible && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Public
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                    <Link
                      href={`/timelines/${timeline.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View
                    </Link>
                    <Link
                      href={`/timelines/${timeline.id}/edit`}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(timeline.id)}
                      disabled={deletingId === timeline.id}
                      className="text-sm text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {deletingId === timeline.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
