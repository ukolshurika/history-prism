import { Head, Link, router, usePage } from '@inertiajs/react'
import Layout from '../Layout'
import { useState } from 'react'
import YandexMapPicker from '../../components/YandexMapPicker'
import { useTranslations } from '../../lib/useTranslations'

export default function Form({ book, current_user, flash, errors, isEdit }) {
  const { yandex_maps_api_key } = usePage().props
  const t = useTranslations()
  const [data, setData] = useState({
    name: book.name || '',
    location: book.location || '',
    latitude: book.latitude || null,
    longitude: book.longitude || null,
    attachment: null,
  })
  const [processing, setProcessing] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setData({ ...data, attachment: file })
    setSelectedFileName(file ? file.name : '')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setProcessing(true)

    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('location', data.location)
    if (data.latitude != null) formData.append('latitude', data.latitude)
    if (data.longitude != null) formData.append('longitude', data.longitude)
    if (data.attachment) {
      formData.append('attachment', data.attachment)
    }

    if (isEdit) {
      router.patch(`/books/${book.id}`, formData, {
        onFinish: () => setProcessing(false),
      })
    } else {
      router.post('/books', formData, {
        onFinish: () => setProcessing(false),
      })
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={isEdit ? t('books.form.edit_title') : t('books.form.new_title')} />

      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/books"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('books.form.back')}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? t('books.form.edit_title') : t('books.form.new_title')}
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t('books.form.book_name')}
                  </label>
                  <input
                    id="name"
                    name="book[name]"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    placeholder={t('books.form.book_name_placeholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={processing}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {t('books.form.book_name_hint')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('books.form.location')}
                  </label>
                  <YandexMapPicker
                    lat={data.latitude}
                    lng={data.longitude}
                    address={data.location}
                    apiKey={yandex_maps_api_key}
                    disabled={processing}
                    onChange={(lat, lng, address) =>
                      setData({ ...data, latitude: lat, longitude: lng, location: address })
                    }
                  />
                </div>

                {!isEdit && (
                  <div>
                    <label
                      htmlFor="attachment"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t('books.form.pdf_file')} <span className="text-red-600">*</span>
                    </label>
                    <div className="flex items-center">
                      <label
                        htmlFor="attachment"
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>{t('books.form.choose_pdf')}</span>
                        <input
                          id="attachment"
                          name="book[attachment]"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={processing}
                          required
                        />
                      </label>
                      {selectedFileName && (
                        <span className="ml-3 text-sm text-gray-600">
                          {selectedFileName}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {t('books.form.pdf_hint')}
                    </p>
                  </div>
                )}

                {isEdit && book.attachment_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('books.form.current_file')}
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{book.attachment_name}</p>
                        <p className="text-xs text-gray-500">{t('books.form.uploaded_on', { date: new Date(book.created_at).toLocaleDateString() })}</p>
                      </div>
                      {book.attachment_url && (
                        <a
                          href={book.attachment_url}
                          className="ml-4 text-sm text-blue-600 hover:text-blue-700"
                          download
                        >
                          {t('books.form.download')}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {errors && errors.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="text-sm font-medium text-red-800">
                          {t('books.form.errors_heading', { count: errors.length })}
                        </h3>
                        <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                          {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Link
                  href="/books"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {t('books.form.cancel')}
                </Link>
                <button
                  type="submit"
                  disabled={(!isEdit && !data.attachment) || processing}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {processing
                    ? (isEdit ? t('books.form.saving') : t('books.form.uploading'))
                    : (isEdit ? t('books.form.save_changes') : t('books.form.upload_button'))}
                </button>
              </div>
            </form>
          </div>

          {isEdit && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">{t('books.form.note_title')}</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    {t('books.form.note_body')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
