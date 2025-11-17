import { Head, Link, router } from '@inertiajs/react'
import Layout from '../Layout'

export default function Show({ person, can_edit, can_delete, current_user, flash }) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this person?')) {
      router.delete(`/people/${person.id}`)
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={person.full_name} />

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/people"
              className="text-blue-600 hover:text-blue-700"
            >
              &larr; Back to People
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {person.full_name}
                  </h1>
                </div>
                {(can_edit || can_delete) && (
                  <div className="flex gap-2">
                    {can_edit && (
                      <Link
                        href={`/people/${person.id}/edit`}
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
                  <dt className="text-sm font-medium text-gray-500">First Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {person.first_name}
                  </dd>
                </div>

                {person.middle_name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Middle Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {person.middle_name}
                    </dd>
                  </div>
                )}

                {person.last_name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {person.last_name}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-500">GEDCOM UUID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {person.gedcom_uuid}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(person.created_at).toLocaleString()}
                  </dd>
                </div>

                {person.updated_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Updated At</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(person.updated_at).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>

              {person.events && person.events.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Associated Events</h3>
                  <div className="grid gap-4">
                    {person.events.map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                            {event.category}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
