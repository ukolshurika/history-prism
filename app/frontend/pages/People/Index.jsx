import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import Layout from '../Layout'

export default function Index({ people, gedcom_files = [], current_user, flash }) {
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    gedcom_file_id: '',
  })

  const handleSearch = (e) => {
    e.preventDefault()

    const params = {}
    Object.keys(searchFilters).forEach(key => {
      if (searchFilters[key]) {
        if (key === 'gedcom_file_id') {
          params[`q[${key}_eq]`] = searchFilters[key]
        } else {
          params[`q[${key}_cont]`] = searchFilters[key]
        }
      }
    })

    router.get('/people', params, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const handleReset = () => {
    setSearchFilters({
      name: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      gedcom_file_id: '',
    })
    router.get('/people', {}, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const handleInputChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

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

          {/* Search Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Filters</h2>
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={searchFilters.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by name"
                  />
                </div>
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    value={searchFilters.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by first name"
                  />
                </div>
                <div>
                  <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    id="middle_name"
                    value={searchFilters.middle_name}
                    onChange={(e) => handleInputChange('middle_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by middle name"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    value={searchFilters.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by last name"
                  />
                </div>
                <div>
                  <label htmlFor="gedcom_file_id" className="block text-sm font-medium text-gray-700 mb-1">
                    GEDCOM File
                  </label>
                  <select
                    id="gedcom_file_id"
                    value={searchFilters.gedcom_file_id}
                    onChange={(e) => handleInputChange('gedcom_file_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Files</option>
                    {gedcom_files.map((file) => (
                      <option key={file.id} value={file.id}>
                        {file.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
                >
                  Reset
                </button>
              </div>
            </form>
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
