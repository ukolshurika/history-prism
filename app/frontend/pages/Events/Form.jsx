import { Head, useForm, Link } from '@inertiajs/react'
import Layout from '../Layout'

export default function Form({ event, categories, isEdit, current_user, flash, errors = [] }) {
  const { data, setData, post, put, processing } = useForm({
    event: {
      title: event.title || '',
      description: event.description || '',
      start_date: event.start_date || '',
      end_date: event.end_date || '',
      category: event.category || 'person',
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isEdit) {
      put(`/events/${event.id}`)
    } else {
      post('/events')
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={isEdit ? 'Edit Event' : 'New Event'} />

      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/events"
              className="text-blue-600 hover:text-blue-700"
            >
              &larr; Back to Events
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-6">
              {isEdit ? 'Edit Event' : 'Create New Event'}
            </h1>

            {errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                {errors.map((error, index) => (
                  <p key={index} className="text-red-600 text-sm">{error}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="event[title]"
                  value={data.event.title}
                  onChange={(e) => setData('event.title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="event[description]"
                  value={data.event.description}
                  onChange={(e) => setData('event.description', e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="event[category]"
                  value={data.event.category}
                  onChange={(e) => setData('event.category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="event[start_date]"
                    value={data.event.start_date ? new Date(data.event.start_date).toISOString().slice(0, 10) : ''}
                    onChange={(e) => setData('event.start_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="event[end_date]"
                    value={data.event.end_date ? new Date(data.event.end_date).toISOString().slice(0, 10) : ''}
                    onChange={(e) => setData('event.end_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Event' : 'Create Event')}
                </button>
                <Link
                  href="/events"
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
