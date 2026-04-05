import { Head, Link, router } from '@inertiajs/react'
import Layout from '../Layout'
import { useState } from 'react'
import { useTranslations } from '../../lib/useTranslations'

export default function Index({ timelines, current_user, flash }) {
  const t = useTranslations()
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = (timelineId) => {
    if (confirm(t('timelines.index.delete_confirm'))) {
      setDeletingId(timelineId)
      router.delete(`/timelines/${timelineId}`, {
        onFinish: () => setDeletingId(null),
      })
    }
  }

  const formatDate = (date) => {
    if (!date) return t('timelines.index.not_available')
    return new Date(date).toLocaleDateString()
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={t('timelines.index.page_title')} />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">{t('timelines.index.heading')}</h1>
            {current_user && (
              <Link
                href="/timelines/new"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('timelines.index.create')}
              </Link>
            )}
          </div>

          {timelines.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 mb-4">{t('timelines.index.empty_title')}</p>
              {current_user && (
                <p className="text-sm text-gray-400">
                  {t('timelines.index.empty_description')}
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {timelines.map((timeline) => (
                <div
                  key={timeline.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {timeline.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {t('timelines.index.person', { name: timeline.person_name || t('timelines.index.unknown') })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('timelines.index.period', { start: formatDate(timeline.start_at), end: formatDate(timeline.end_at) })}
                    </p>
                    {timeline.visible && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        {t('timelines.index.public')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                    <Link
                      href={`/timelines/${timeline.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {t('timelines.index.view')}
                    </Link>
                    <Link
                      href={`/timelines/${timeline.id}/edit`}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      {t('timelines.index.edit')}
                    </Link>
                    <button
                      onClick={() => handleDelete(timeline.id)}
                      disabled={deletingId === timeline.id}
                      className="text-sm text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {deletingId === timeline.id ? t('timelines.index.deleting') : t('timelines.index.delete')}
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
