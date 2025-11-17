import { Head, useForm, Link } from '@inertiajs/react'
import Layout from '../Layout'

export default function Form({ person, events = [], isEdit, current_user, flash, errors = [] }) {
  const { data, setData, post, put, processing } = useForm({
    person: {
      first_name: person.first_name || '',
      middle_name: person.middle_name || '',
      last_name: person.last_name || '',
      gedcom_uuid: person.gedcom_uuid || '',
      event_ids: person.event_ids || [],
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isEdit) {
      put(`/people/${person.id}`)
    } else {
      post('/people')
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={isEdit ? 'Edit Person' : 'New Person'} />

      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/people"
              className="text-blue-600 hover:text-blue-700"
            >
              &larr; Back to People
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-6">
              {isEdit ? 'Edit Person' : 'Add New Person'}
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
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="person[first_name]"
                  value={data.person.first_name}
                  onChange={(e) => setData('person.first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  id="middle_name"
                  name="person[middle_name]"
                  value={data.person.middle_name}
                  onChange={(e) => setData('person.middle_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="person[last_name]"
                  value={data.person.last_name}
                  onChange={(e) => setData('person.last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="gedcom_uuid" className="block text-sm font-medium text-gray-700 mb-1">
                  GEDCOM UUID *
                </label>
                <input
                  type="text"
                  id="gedcom_uuid"
                  name="person[gedcom_uuid]"
                  value={data.person.gedcom_uuid}
                  onChange={(e) => setData('person.gedcom_uuid', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Unique identifier for GEDCOM format
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="events" className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Events (Person Type Only)
                </label>
                <select
                  id="events"
                  name="person[event_ids][]"
                  multiple
                  value={data.person.event_ids}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                    setData('person.event_ids', selected)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                >
                  {events.length === 0 ? (
                    <option disabled>No person-type events available</option>
                  ) : (
                    events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title} ({new Date(event.start_date).toLocaleDateString()})
                      </option>
                    ))
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Hold Ctrl (Windows) or Cmd (Mac) to select multiple events. Only person-type events are shown.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Person' : 'Add Person')}
                </button>
                <Link
                  href="/people"
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
