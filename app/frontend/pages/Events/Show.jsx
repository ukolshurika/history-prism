import { Head, Link, router } from '@inertiajs/react'
import Layout from '../Layout'

export default function Show({ event, can_edit, can_delete, current_user, flash }) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this event?')) {
      router.delete(`/events/${event.id}`)
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={event.title} />

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/events"
              className="text-blue-600 hover:text-blue-700"
            >
              &larr; Back to Events
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-3 py-1 text-sm font-semibold rounded bg-blue-100 text-blue-800 mb-2">
                    {event.category}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {event.title}
                  </h1>
                </div>
                {(can_edit || can_delete) && (
                  <div className="flex gap-2">
                    {can_edit && (
                      <Link
                        href={`/events/${event.id}/edit`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Edit
                      </Link>
                    )}
                    {can_delete && (
                      <button
                        onClick={handleDelete}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap col-span-2">
                    {event.description}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(event.start_date).toLocaleString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">End Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(event.end_date).toLocaleString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Created By</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {event.creator.email}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(event.created_at).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
