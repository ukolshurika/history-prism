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
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
              {people.map((person) => (
                <Link
                  key={person.id}
                  href={`/people/${person.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {person.full_name}
                  </h2>
                  {(person.birth_year || person.death_year) && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-600">
                        {person.birth_year || '?'} – {person.death_year || '?'}
                      </span>
                    </div>
                  )}
                  {person.events && person.events.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-500">
                        {person.events.length} {person.events.length === 1 ? 'event' : 'events'}
                      </span>
                    </div>
                  )}
                  <div className="mt-3 space-y-2">
                    {person.timelines && person.timelines.length > 0 && (
                      <>
                        {person.timelines.map((timeline) => (
                          <Link
                            key={timeline.id}
                            href={`/timelines/${timeline.id}`}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg width="17" height="15" viewBox="0 0 34 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.09 16.6667C23.7017 16.6667 25.0067 17.9733 25.0067 19.5833V27.0833C25.0067 27.8569 24.6994 28.5987 24.1524 29.1457C23.6054 29.6927 22.8635 30 22.09 30H2.92333C2.14979 30 1.40792 29.6927 0.860939 29.1457C0.313958 28.5987 0.00666658 27.8569 0.00666658 27.0833V19.5833C0.00666658 17.9733 1.31333 16.6667 2.92333 16.6667H22.09ZM31.6733 19.8317V28.75C31.6732 29.0667 31.5529 29.3716 31.3367 29.603C31.1205 29.8344 30.8245 29.9751 30.5085 29.9967C30.1926 30.0183 29.8802 29.9191 29.6345 29.7193C29.3888 29.5194 29.2282 29.2337 29.185 28.92L29.1733 28.75V19.8533C29.9951 20.0579 30.8553 20.0505 31.6733 19.8317ZM22.09 19.1667H2.92333C2.81283 19.1667 2.70685 19.2106 2.62871 19.2887C2.55057 19.3668 2.50667 19.4728 2.50667 19.5833V27.0833C2.50667 27.3133 2.69333 27.5 2.92333 27.5H22.09C22.2005 27.5 22.3065 27.4561 22.3846 27.378C22.4628 27.2998 22.5067 27.1938 22.5067 27.0833V19.5833C22.5067 19.4728 22.4628 19.3668 22.3846 19.2887C22.3065 19.2106 22.2005 19.1667 22.09 19.1667ZM30.4233 11.82C31.2667 11.82 32.0756 12.155 32.6719 12.7514C33.2683 13.3478 33.6033 14.1566 33.6033 15C33.6033 15.8434 33.2683 16.6522 32.6719 17.2486C32.0756 17.845 31.2667 18.18 30.4233 18.18C29.5799 18.18 28.7711 17.845 28.1747 17.2486C27.5784 16.6522 27.2433 15.8434 27.2433 15C27.2433 14.1566 27.5784 13.3478 28.1747 12.7514C28.7711 12.155 29.5799 11.82 30.4233 11.82ZM22.0833 1.0428e-06C23.695 1.0428e-06 25 1.30667 25 2.91667V10.4167C25 11.1902 24.6927 11.9321 24.1457 12.4791C23.5987 13.026 22.8569 13.3333 22.0833 13.3333H2.91667C2.14312 13.3333 1.40125 13.026 0.854272 12.4791C0.307291 11.9321 0 11.1902 0 10.4167V2.91667C6.1778e-05 2.18442 0.275552 1.47898 0.771746 0.940488C1.26794 0.401991 1.94853 0.0698362 2.67833 0.0100011L2.91667 1.0428e-06H22.0833ZM22.0833 2.5H2.91667L2.82167 2.51167C2.73027 2.53307 2.64877 2.58471 2.59039 2.65822C2.53201 2.73173 2.50016 2.8228 2.5 2.91667V10.4167C2.5 10.6467 2.68667 10.8333 2.91667 10.8333H22.0833C22.1938 10.8333 22.2998 10.7894 22.378 10.7113C22.4561 10.6332 22.5 10.5272 22.5 10.4167V2.91667C22.5 2.80616 22.4561 2.70018 22.378 2.62204C22.2998 2.5439 22.1938 2.5 22.0833 2.5ZM30.4233 1.0428e-06C30.7257 -0.000389305 31.0179 0.108821 31.2459 0.307398C31.4739 0.505976 31.6222 0.78046 31.6633 1.08L31.6733 1.25V10.1683C30.8553 9.94952 29.9951 9.94207 29.1733 10.1467V1.25C29.1733 0.91848 29.305 0.600538 29.5394 0.366117C29.7739 0.131697 30.0918 1.0428e-06 30.4233 1.0428e-06Z" fill="currentColor"/>
                            </svg>
                            <span>{timeline.title}</span>
                          </Link>
                        ))}
                      </>
                    )}
                    <Link
                      href={`/timelines/new?person_id=${person.id}`}
                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800"
                      onClick={(e) => e.stopPropagation()}
                      title="Create new timeline"
                    >
                      <svg width="20" height="20" viewBox="0 0 74 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25.4167 21.6667C27.0283 21.6667 28.3333 22.9733 28.3333 24.5833V32.0833C28.3333 32.8569 28.026 33.5987 27.4791 34.1457C26.9321 34.6927 26.1902 35 25.4167 35H6.24999C5.47645 35 4.73458 34.6927 4.1876 34.1457C3.64062 33.5987 3.33333 32.8569 3.33333 32.0833V24.5833C3.33333 22.9733 4.63999 21.6667 6.24999 21.6667H25.4167ZM35 24.8317V33.75C34.9999 34.0667 34.8796 34.3716 34.6634 34.603C34.4472 34.8344 34.1512 34.9751 33.8352 34.9967C33.5192 35.0183 33.2068 34.9191 32.9612 34.7193C32.7155 34.5194 32.5548 34.2337 32.5117 33.92L32.5 33.75V24.8533C33.3217 25.0579 34.1819 25.0505 35 24.8317ZM25.4167 24.1667H6.24999C6.13949 24.1667 6.03351 24.2106 5.95537 24.2887C5.87723 24.3668 5.83333 24.4728 5.83333 24.5833V32.0833C5.83333 32.3133 6.01999 32.5 6.24999 32.5H25.4167C25.5272 32.5 25.6331 32.4561 25.7113 32.378C25.7894 32.2998 25.8333 32.1938 25.8333 32.0833V24.5833C25.8333 24.4728 25.7894 24.3668 25.7113 24.2887C25.6331 24.2106 25.5272 24.1667 25.4167 24.1667ZM33.75 16.82C34.5934 16.82 35.4022 17.155 35.9986 17.7514C36.595 18.3478 36.93 19.1566 36.93 20C36.93 20.8434 36.595 21.6522 35.9986 22.2486C35.4022 22.845 34.5934 23.18 33.75 23.18C32.9066 23.18 32.0978 22.845 31.5014 22.2486C30.905 21.6522 30.57 20.8434 30.57 20C30.57 19.1566 30.905 18.3478 31.5014 17.7514C32.0978 17.155 32.9066 16.82 33.75 16.82ZM25.41 5C27.0217 5 28.3267 6.30667 28.3267 7.91667V15.4167C28.3267 16.1902 28.0194 16.9321 27.4724 17.4791C26.9254 18.026 26.1835 18.3333 25.41 18.3333H6.24333C5.46978 18.3333 4.72791 18.026 4.18093 17.4791C3.63395 16.9321 3.32666 16.1902 3.32666 15.4167V7.91667C3.32672 7.18442 3.60221 6.47898 4.09841 5.94049C4.5946 5.40199 5.27519 5.06984 6.00499 5.01L6.24333 5H25.41ZM25.41 7.5H6.24333L6.14833 7.51167C6.05693 7.53307 5.97543 7.58471 5.91705 7.65822C5.85867 7.73173 5.82682 7.8228 5.82666 7.91667V15.4167C5.82666 15.6467 6.01333 15.8333 6.24333 15.8333H25.41C25.5205 15.8333 25.6265 15.7894 25.7046 15.7113C25.7828 15.6332 25.8267 15.5272 25.8267 15.4167V7.91667C25.8267 7.80616 25.7828 7.70018 25.7046 7.62204C25.7265 7.5439 25.5205 7.5 25.41 7.5ZM33.75 5C34.0523 4.99961 34.3446 5.10882 34.5726 5.3074C34.8006 5.50598 34.9489 5.78046 34.99 6.08L35 6.25V15.1683C34.1819 14.9495 33.3217 14.9421 32.5 15.1467V6.25C32.5 5.91848 32.6317 5.60054 32.8661 5.36612C33.1005 5.1317 33.4185 5 33.75 5Z" fill="currentColor"/>
                        <path d="M44 17.5C44 17.1685 44.1317 16.8505 44.3661 16.6161C44.6005 16.3817 44.9185 16.25 45.25 16.25H50.25V11.25C50.25 10.9185 50.3817 10.6005 50.6161 10.3661C50.8505 10.1317 51.1685 10 51.5 10C51.8315 10 52.1495 10.1317 52.3839 10.3661C52.6183 10.6005 52.75 10.9185 52.75 11.25V16.25H57.75C58.0815 16.25 58.3995 16.3817 58.6339 16.6161C58.8683 16.8505 59 17.1685 59 17.5C59 17.8315 58.8683 18.1495 58.6339 18.3839C58.3995 18.6183 58.0815 18.75 57.75 18.75H52.75V23.75C52.75 24.0815 52.6183 24.3995 52.3839 24.6339C52.1495 24.8683 51.8315 25 51.5 25C51.1685 25 50.8505 24.8683 50.6161 24.6339C50.3817 24.3995 50.25 24.0815 50.25 23.75V18.75H45.25C44.9185 18.75 44.6005 18.6183 44.3661 18.3839C44.1317 18.1495 44 17.8315 44 17.5ZM44 5C42.6739 5 41.4021 5.52678 40.4645 6.46447C39.5268 7.40215 39 8.67392 39 10V25C39 26.3261 39.5268 27.5979 40.4645 28.5355C41.4021 29.4732 42.6739 30 44 30H59C60.3261 30 61.5979 29.4732 62.5355 28.5355C63.4732 27.5979 64 26.3261 64 25V10C64 8.67392 63.4732 7.40215 62.5355 6.46447C61.5979 5.52678 60.3261 5 59 5H44ZM41.5 10C41.5 9.33696 41.7634 8.70107 42.2322 8.23223C42.7011 7.76339 43.337 7.5 44 7.5H59C59.663 7.5 60.2989 7.76339 60.7678 8.23223C61.2366 8.70107 61.5 9.33696 61.5 10V25C61.5 25.663 61.2366 26.2989 60.7678 26.7678C60.2989 27.2366 59.663 27.5 59 27.5H44C43.337 27.5 42.7011 27.2366 42.2322 26.7678C41.7634 26.2989 41.5 25.663 41.5 25V10ZM60.25 32.5C61.9076 32.5 63.4973 31.8415 64.6694 30.6694C65.8415 29.4973 66.5 27.9076 66.5 26.25V8.17C67.2601 8.60883 67.8913 9.24 68.3301 10.0001C68.7689 10.7601 69 11.6223 69 12.5V26.25C69 28.5706 68.0781 30.7962 66.4372 32.4372C64.7962 34.0781 62.5706 35 60.25 35H46.5C45.6223 35 44.7601 34.7689 44.0001 34.3301C43.24 33.8913 42.6088 33.2601 42.17 32.5H60.25Z" fill="currentColor"/>
                      </svg>
                      <span>New timeline</span>
                    </Link>
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
