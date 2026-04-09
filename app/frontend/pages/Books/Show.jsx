import { Head, Link, router } from '@inertiajs/react'
import Layout from '../Layout'
import { useTranslations } from '../../lib/useTranslations'

export default function Show({ book, can_edit, can_delete, current_user, flash }) {
  const t = useTranslations()

  const handleDelete = () => {
    if (confirm(t('books.index.delete_confirm', { name: book.name || book.attachment_name }))) {
      router.delete(`/books/${book.id}`)
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={book.name || book.attachment_name} />

      <div className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/books" className="text-blue-600 hover:text-blue-700">
              &larr; {t('books.show.back')}
            </Link>
          </div>

          <div className="rounded-lg bg-white p-8 shadow-lg">
            <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{book.name || book.attachment_name}</h1>
                <p className="mt-2 text-sm text-gray-500">
                  {t('books.show.uploaded_on', { date: new Date(book.created_at).toLocaleDateString() })}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {book.attachment_url && (
                  <a
                    href={book.attachment_url}
                    download
                    className="rounded-md border border-green-200 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
                  >
                    {t('books.show.download')}
                  </a>
                )}
                {can_edit && (
                  <Link
                    href={`/books/${book.id}/edit`}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    {t('books.show.edit')}
                  </Link>
                )}
                {can_delete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    {t('books.show.delete')}
                  </button>
                )}
              </div>
            </div>

            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('books.show.location')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{book.location || t('books.show.no_location')}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">{t('books.show.events_count')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{book.events_count || 0}</dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">{t('books.show.file')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{book.attachment_name}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  )
}
