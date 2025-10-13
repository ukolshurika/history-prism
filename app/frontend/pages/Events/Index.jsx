import { Head, Link } from '@inertiajs/react'
import Layout from '../Layout'

export default function Index({ events, current_user, flash }) {
  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title="Events" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            {current_user && (
              <div className="flex gap-2 items-center">
                <Link
                  href="/events/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Event
                </Link>
                <Link
                  href="/events/new"
                  className="bg-blue-600 text-white w-10 h-10 rounded-full hover:bg-blue-700 flex items-center justify-center text-2xl font-light"
                  title="Create new event"
                >
                  +
                </Link>
              </div>
            )}
          </div>

          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 mb-4">No events yet.</p>
              {current_user && (
                <div className="flex flex-col items-center gap-3">
                  <Link
                    href="/events/new"
                    className="bg-blue-600 text-white w-16 h-16 rounded-full hover:bg-blue-700 flex items-center justify-center text-4xl font-light shadow-lg"
                    title="Create new event"
                  >
                    +
                  </Link>
                  <Link
                    href="/events/new"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Create the first event
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      {event.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>
                      Start: {new Date(event.start_date).toLocaleDateString()}
                    </p>
                    <p>
                      End: {new Date(event.end_date).toLocaleDateString()}
                    </p>
                    <p className="mt-2">
                      By: {event.creator.email}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
