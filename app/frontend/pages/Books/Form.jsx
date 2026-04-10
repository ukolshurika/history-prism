import { Head, Link, router, usePage } from '@inertiajs/react'
import Layout from '../Layout'
import { useState } from 'react'
import YandexMapPicker from '../../components/YandexMapPicker'
import { useTranslations } from '../../lib/useTranslations'
import {
  ActionLink,
  PageFrame,
  PageSection,
  SurfaceCard,
} from '../../components/prism/PrismUI'

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

      <PageFrame>
        <div className="mb-6">
          <ActionLink href="/books" variant="secondary">
            {t('books.form.back')}
          </ActionLink>
        </div>

        <PageSection
          title={isEdit ? t('books.form.edit_title') : t('books.form.new_title')}
          surfaceClassName="p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="prism-label">
                  {t('books.form.book_name')}
                </label>
                <input
                  id="name"
                  name="book[name]"
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  placeholder={t('books.form.book_name_placeholder')}
                  className="prism-input"
                  disabled={processing}
                />
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  {t('books.form.book_name_hint')}
                </p>
              </div>

              <div>
                <label className="prism-label">
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
                  <label htmlFor="attachment" className="prism-label">
                    {t('books.form.pdf_file')} <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="attachment"
                      className="prism-button prism-button-secondary cursor-pointer"
                    >
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
                      <span className="text-sm text-stone-500">
                        {selectedFileName}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    {t('books.form.pdf_hint')}
                  </p>
                </div>
              )}

              {isEdit && book.attachment_name && (
                <div>
                  <label className="prism-label">
                    {t('books.form.current_file')}
                  </label>
                  <div className="flex items-center gap-4 rounded-[20px] border border-stone-200 bg-stone-50 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-stone-900">{book.attachment_name}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        {t('books.form.uploaded_on', { date: new Date(book.created_at).toLocaleDateString() })}
                      </p>
                    </div>
                    {book.attachment_url && (
                      <a
                        href={book.attachment_url}
                        className="prism-link text-sm"
                        download
                      >
                        {t('books.form.download')}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {errors && errors.length > 0 && (
                <div className="rounded-[20px] border border-red-200 bg-red-50 p-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800">
                        {errors.length === 1
                          ? t('books.form.error_heading_one')
                          : t('books.form.errors_heading', { count: errors.length })}
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

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/books"
                className="prism-link text-sm"
              >
                {t('books.form.cancel')}
              </Link>
              <button
                type="submit"
                disabled={(!isEdit && !data.attachment) || processing}
                className="prism-button prism-button-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing
                  ? (isEdit ? t('books.form.saving') : t('books.form.uploading'))
                  : (isEdit ? t('books.form.save_changes') : t('books.form.upload_button'))}
              </button>
            </div>
          </form>
        </PageSection>

        {isEdit && (
          <SurfaceCard className="mt-6 border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex gap-3">
              <div>
                <h3 className="text-sm font-medium text-yellow-800">{t('books.form.note_title')}</h3>
                <p className="mt-1 text-sm leading-6 text-yellow-700">
                  {t('books.form.note_body')}
                </p>
              </div>
            </div>
          </SurfaceCard>
        )}
      </PageFrame>
    </Layout>
  )
}
