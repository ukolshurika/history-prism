import { Head, Link, router, usePage } from '@inertiajs/react'
import Layout from '../Layout'
import { useState } from 'react'
import YandexMapPicker from '../../components/YandexMapPicker'
import { useTranslations } from '../../lib/useTranslations'
import {
  ActionButton,
  ActionLink,
  Card,
  EmptyState,
  PageFrame,
  PageSection,
  SectionIntro,
} from '../../components/prism/PrismUI'

export default function Index({ books, current_user, flash, errors }) {
  const { yandex_maps_api_key } = usePage().props
  const t = useTranslations()
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
    if (confirm(t('books.index.delete_confirm', { name: bookName }))) {
      router.delete(`/books/${bookId}`)
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={t('books.index.page_title')} />

      <PageFrame>
        <SectionIntro
          kicker={t('books.index.page_title')}
          title={t('books.index.heading')}
          actions={current_user && (
            <ActionLink href="/books/new" variant="primary">
              {t('books.form.new_title')}
            </ActionLink>
          )}
        />

        {current_user && (
          <PageSection
            title={t('books.index.upload_heading')}
            className="mb-6"
            surfaceClassName="p-6 sm:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5">
                <div>
                  <label htmlFor="name" className="prism-label">
                    {t('books.index.book_name_optional')}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('books.index.book_name_placeholder')}
                    className="prism-input"
                    disabled={processing}
                  />
                </div>

                <div>
                  <label className="prism-label">
                    {t('books.index.location')}
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
                    className="prism-button prism-button-secondary cursor-pointer"
                  >
                    <span>{t('books.index.choose_pdf')}</span>
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
                    <span className="ml-3 text-sm text-stone-500">
                      {t('books.index.selected', { file: selectedFileName })}
                    </span>
                  )}
                </div>
              </div>

              {errors && errors.length > 0 && (
                <div className="rounded-[20px] border border-red-200 bg-red-50 p-4">
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={!attachment || processing}
                className="prism-button prism-button-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? t('books.index.uploading') : t('books.index.upload_button')}
              </button>
            </form>
          </PageSection>
        )}

        {books.length === 0 ? (
          <EmptyState
            title={t('books.index.empty_title')}
            description={current_user ? t('books.index.empty_description') : null}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <Card key={book.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-stone-900">
                      {book.name || book.attachment_name}
                    </h3>
                    {book.location && (
                      <p className="mt-2 text-sm text-stone-600">
                        {book.location}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-stone-500">
                      {t('books.index.uploaded_on', { date: new Date(book.created_at).toLocaleDateString() })}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {t('books.index.events_count', { count: book.events_count || 0 })}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-stone-200 pt-4">
                  <Link href={`/books/${book.id}`} className="prism-link-emphasis text-sm">
                    {t('books.index.view_book')}
                  </Link>
                  {book.attachment_url && (
                    <a href={book.attachment_url} className="prism-link text-sm" download>
                      {t('books.index.download')}
                    </a>
                  )}
                  <Link href={`/books/${book.id}/edit`} className="prism-link text-sm">
                    {t('books.index.edit')}
                  </Link>
                  <ActionButton
                    variant="soft"
                    onClick={() => handleDelete(book.id, book.name || book.attachment_name)}
                    className="px-0 py-0 text-sm text-red-600 hover:text-red-700"
                  >
                    {t('books.index.delete')}
                  </ActionButton>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageFrame>
    </Layout>
  )
}
