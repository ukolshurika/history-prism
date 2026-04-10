import { Head, useForm, router } from '@inertiajs/react'
import Layout from '../Layout'
import { useState } from 'react'
import { useTranslations } from '../../lib/useTranslations'
import {
  ActionButton,
  Card,
  EmptyState,
  PageFrame,
  PageSection,
  SectionIntro,
} from '../../components/prism/PrismUI'

export default function Index({ gedcom_files, current_user, flash, errors, meta }) {
  const t = useTranslations()
  const { data, setData, post, processing, reset } = useForm({
    file: null,
  })
  const [selectedFileName, setSelectedFileName] = useState('')
  const [reprocessingId, setReprocessingId] = useState(null)
  const pagination = meta

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setData('file', file)
    setSelectedFileName(file ? file.name : '')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    post('/gedcom_files', {
      onSuccess: () => {
        reset()
        setSelectedFileName('')
      },
    })
  }

  const handleReprocess = (gedcomFileId) => {
    setReprocessingId(gedcomFileId)
    router.post(`/gedcom_files/${gedcomFileId}/reprocess`, {}, {
      onFinish: () => setReprocessingId(null),
    })
  }

  const handlePage = (page) => {
    router.get('/gedcom_files', { page }, { preserveState: true, preserveScroll: false })
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={t('gedcom_files.index.page_title')} />

      <PageFrame>
        <SectionIntro
          kicker={t('gedcom_files.index.page_title')}
          title={t('gedcom_files.index.heading')}
          description={current_user ? t('gedcom_files.index.empty_description') : null}
        />

        {current_user && (
          <PageSection
            title={t('gedcom_files.index.upload_heading')}
            className="mb-6"
            surfaceClassName="p-6 sm:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="file-upload"
                  className="prism-button prism-button-secondary cursor-pointer"
                >
                  <span>{t('gedcom_files.index.choose_file')}</span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".ged"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={processing}
                  />
                </label>
                {selectedFileName && (
                  <span className="ml-3 text-sm text-stone-500">
                    {t('gedcom_files.index.selected', { file: selectedFileName })}
                  </span>
                )}
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
                disabled={!data.file || processing}
                className="prism-button prism-button-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? t('gedcom_files.index.uploading') : t('gedcom_files.index.upload')}
              </button>
            </form>
          </PageSection>
        )}

        {gedcom_files.length === 0 ? (
          <EmptyState title={t('gedcom_files.index.empty_title')} />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gedcom_files.map((gedcom_file) => (
                <Card key={gedcom_file.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-semibold text-stone-900">
                        {gedcom_file.file_name}
                      </h3>
                      <p className="mt-2 text-sm text-stone-500">
                        {t('gedcom_files.index.uploaded_on', { date: new Date(gedcom_file.created_at).toLocaleDateString() })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-stone-200 pt-4">
                    {gedcom_file.file_url && (
                      <a
                        href={gedcom_file.file_url}
                        className="prism-link-emphasis text-sm"
                        download
                      >
                        {t('gedcom_files.index.download')}
                      </a>
                    )}
                    <ActionButton
                      variant="soft"
                      onClick={() => handleReprocess(gedcom_file.id)}
                      disabled={reprocessingId === gedcom_file.id}
                      className="px-0 py-0 text-sm text-emerald-700 hover:text-emerald-800 disabled:cursor-not-allowed disabled:text-stone-400"
                    >
                      {reprocessingId === gedcom_file.id ? t('gedcom_files.index.processing') : t('gedcom_files.index.reprocess')}
                    </ActionButton>
                  </div>
                </Card>
              ))}
            </div>

            {pagination && pagination.total_pages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-stone-600">
                  {t('gedcom_files.index.total', { count: pagination.total })}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="prism-button prism-button-secondary px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    &laquo;
                  </button>

                  {buildPageNumbers(pagination.page, pagination.total_pages).map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 py-1 text-sm text-stone-400">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => handlePage(p)}
                        className={`prism-button px-3 py-1 text-sm ${
                          p === pagination.page
                            ? 'prism-button-primary'
                            : 'prism-button-secondary'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePage(pagination.page + 1)}
                    disabled={pagination.page === pagination.total_pages}
                    className="prism-button prism-button-secondary px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    &raquo;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </PageFrame>
    </Layout>
  )
}

function buildPageNumbers(current, total) {
  const pages = []
  if (total <= 7) {
    for (let i = 1; i <= total; i += 1) pages.push(i)
    return pages
  }
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i += 1) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
