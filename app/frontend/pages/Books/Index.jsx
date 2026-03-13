import { Head, Link, router, usePage } from '@inertiajs/react'
import Layout from '../Layout'
import { useState } from 'react'
import YandexMapPicker from '../../components/YandexMapPicker'

export default function Index({ books, current_user, flash, errors }) {
  const { yandex_maps_api_key } = usePage().props
  const [attachment, setAttachment] = useState(null)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null
    setAttachment(file)
    setSelectedFileName(file ? file.name : '')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setProcessing(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('location', location)
    if (latitude != null) formData.append('latitude', latitude)
    if (longitude != null) formData.append('longitude', longitude)
    if (attachment) formData.append('attachment', attachment)
    router.post('/books', formData, {
      onSuccess: () => {
        setAttachment(null)
        setName('')
        setLocation('')
        setLatitude(null)
        setLongitude(null)
        setSelectedFileName('')
      },
      onFinish: () => setProcessing(false),
    })
  }

  const handleDelete = (bookId, bookName) => {
    if (confirm(`Are you sure you want to delete "${bookName}"? This will also delete all associated events.`)) {
      router.delete(`/books/${bookId}`)
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title="Books" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">History Books</h1>

            {/* Upload Form */}
            {current_user && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Book</h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Book Name (optional)
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Family History Journal"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        disabled={processing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <YandexMapPicker
                        lat={latitude}
                        lng={longitude}
                        address={location}
                        apiKey={yandex_maps_api_key}
                        disabled={processing}
                        onChange={(lat, lng, address) => {
                          setLatitude(lat)
                          setLongitude(lng)
                          setLocation(address)
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Choose PDF file</span>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={processing}
                        />
                      </label>
                      {selectedFileName && (
                        <span className="ml-3 text-sm text-gray-600">
                          Selected: {selectedFileName}
                        </span>
                      )}
                    </div>
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

                  <button
                    type="submit"
                    disabled={!attachment || processing}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {processing ? 'Uploading...' : 'Upload Book'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Books List */}
          {books.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-gray-500 mb-4 mt-4">No books uploaded yet.</p>
              {current_user && (
                <p className="text-sm text-gray-400">
                  Upload your first book above to extract historical events from PDFs.
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3 flex-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {book.name || book.attachment_name}
                      </h3>
                      {book.location && (
                        <p className="text-sm text-gray-600 mb-2">
                          <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {book.location}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Uploaded: {new Date(book.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Events: {book.events_count || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                    <Link
                      href={`/books/${book.id}`}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Events
                    </Link>
                    {book.attachment_url && (
                      <a
                        href={book.attachment_url}
                        className="inline-flex items-center text-sm text-green-600 hover:text-green-700"
                        download
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                    )}
                    <Link
                      href={`/books/${book.id}/edit`}
                      className="inline-flex items-center text-sm text-gray-600 hover:text-gray-700"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(book.id, book.name || book.attachment_name)}
                      className="inline-flex items-center text-sm text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
