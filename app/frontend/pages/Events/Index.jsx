import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import Layout from '../Layout'

export default function Index({ events, current_user, flash, pagination, filters = {} }) {
  const [searchQuery, setSearchQuery] = useState(filters.q || '')

  const activeFilters = {
    source_type: filters.source_type,
    source_id: filters.source_id,
    sort: filters.sort,
    direction: filters.direction,
  }

  const navigate = (params) => {
    const merged = {}
    Object.entries({ ...activeFilters, ...params }).forEach(([k, v]) => {
      if (v != null && v !== '') merged[k] = v
    })
    router.get('/events', merged, { preserveState: true, preserveScroll: false })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    navigate({ q: searchQuery, page: 1 })
  }

  const handleSort = (col) => {
    const isSame = filters.sort === col
    const dir = isSame && filters.direction === 'asc' ? 'desc' : 'asc'
    navigate({ q: filters.q, sort: col, direction: dir, page: 1 })
  }

  const handlePage = (page) => {
    navigate({ q: filters.q, page })
  }

  const SortIcon = ({ col }) => {
    if (filters.sort !== col) return <span className="ml-1 text-gray-400">↕</span>
    return <span className="ml-1">{filters.direction === 'desc' ? '↓' : '↑'}</span>
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title="Events" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            {current_user && (
              <Link
                href="/events/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                + New Event
              </Link>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Search
            </button>
            {filters.q && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); navigate({ q: '', page: 1 }) }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Clear
              </button>
            )}
          </form>

          {/* Active filters badge */}
          {(filters.source_type || filters.source_id) && (
            <div className="mb-3 text-sm text-gray-600">
              Filtered by source: {filters.source_type} #{filters.source_id}
            </div>
          )}

          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 mb-4">No events found.</p>
              {current_user && (
                <Link href="/events/new" className="text-blue-600 hover:text-blue-700">
                  Create the first event
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('date')}
                      >
                        Start Date <SortIcon col="date" />
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('place')}
                      >
                        Place <SortIcon col="place" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Page
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 max-w-xs">
                          <Link
                            href={`/events/${event.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium line-clamp-2"
                          >
                            {event.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                            {event.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {event.start_date_display || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {event.location?.place || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[160px] truncate">
                          {event.source_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {event.page_number
                            ? event.source_attachment_url
                              ? <a
                                  href={`${event.source_attachment_url}#page=${event.page_number}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {event.page_number}
                                </a>
                              : event.page_number
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Total: {pagination.total_count}
                  </p>
                  <div className="flex gap-1 items-center">
                    <button
                      onClick={() => handlePage(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      &laquo;
                    </button>

                    {buildPageNumbers(pagination.current_page, pagination.total_pages).map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 py-1 text-sm text-gray-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => handlePage(p)}
                          className={`px-3 py-1 text-sm border rounded ${
                            p === pagination.current_page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => handlePage(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.total_pages}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      &raquo;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

function buildPageNumbers(current, total) {
  const pages = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
