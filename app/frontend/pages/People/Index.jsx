import { Head, Link } from '@inertiajs/react'
import Layout from '../Layout'

export default function Index({ people, current_user, flash }) {
  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title="People" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">People</h1>
            {current_user && (
              <div className="flex gap-2 items-center">
                <Link
                  href="/people/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add Person
                </Link>
                <Link
                  href="/people/new"
                  className="bg-blue-600 text-white w-10 h-10 rounded-full hover:bg-blue-700 flex items-center justify-center text-2xl font-light"
                  title="Add new person"
                >
                  +
                </Link>
              </div>
            )}
          </div>

          {people.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 mb-4">No people yet.</p>
              {current_user && (
                <div className="flex flex-col items-center gap-3">
                  <Link
                    href="/people/new"
                    className="bg-blue-600 text-white w-16 h-16 rounded-full hover:bg-blue-700 flex items-center justify-center text-4xl font-light shadow-lg"
                    title="Add new person"
                  >
                    +
                  </Link>
                  <Link
                    href="/people/new"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Add the first person
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {people.map((person) => (
                <Link
                  key={person.id}
                  href={`/people/${person.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {person.full_name}
                  </h2>
                  {person.events && person.events.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-500">
                        {person.events.length} {person.events.length === 1 ? 'event' : 'events'}
                      </span>
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    <p>First Name: {person.first_name}</p>
                    {person.middle_name && <p>Middle Name: {person.middle_name}</p>}
                    {person.last_name && <p>Last Name: {person.last_name}</p>}
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
