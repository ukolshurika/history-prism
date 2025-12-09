import { Head, useForm } from '@inertiajs/react'
import Layout from '../Layout'

export default function Form({ timeline, people, current_user, flash, errors, isEdit }) {
  const { data, setData, post, patch, processing } = useForm({
    title: timeline.title || '',
    person_id: timeline.person_id || '',
    visible: timeline.visible || false,
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isEdit) {
      patch(`/timelines/${timeline.id}`)
    } else {
      post('/timelines')
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={isEdit ? 'Edit Timeline' : 'Create Timeline'} />

      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {isEdit ? 'Edit Timeline' : 'Create New Timeline'}
          </h1>

          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={processing}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="person_id"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Person *
                </label>
                <select
                  id="person_id"
                  value={data.person_id}
                  onChange={(e) => setData('person_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={processing || isEdit}
                >
                  <option value="">Select a person</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
                {isEdit && (
                  <p className="mt-1 text-sm text-gray-500">
                    Person cannot be changed after creation
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.visible}
                    onChange={(e) => setData('visible', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={processing}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Make this timeline public
                  </span>
                </label>
              </div>

              {errors && errors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <ul className="list-disc list-inside text-red-700">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? 'Saving...' : isEdit ? 'Update Timeline' : 'Create Timeline'}
                </button>
                <a
                  href="/timelines"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
