import { Head, Link, router } from '@inertiajs/react'
import Layout from '../Layout'
import { useState } from 'react'
import { useTranslations } from '../../lib/useTranslations'
import {
  ActionLink,
  ActionButton,
  Card,
  EmptyState,
  PageFrame,
  SectionIntro
} from '../../components/prism/PrismUI'

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

      <PageFrame>
        <SectionIntro
          kicker={t('timelines.index.page_title')}
          title={t('timelines.index.heading')}
          actions={current_user && (
            <ActionLink href="/timelines/new" variant="primary">
              {t('timelines.index.create')}
            </ActionLink>
          )}
        />

        {timelines.length === 0 ? (
          <EmptyState
            title={t('timelines.index.empty_title')}
            description={current_user ? t('timelines.index.empty_description') : null}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {timelines.map((timeline) => (
              <Card key={timeline.id} className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-stone-900">{timeline.title}</h3>
                  <p className="mt-2 text-sm text-stone-600">
                    {t('timelines.index.person', { name: timeline.person_name || t('timelines.index.unknown') })}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {t('timelines.index.period', { start: formatDate(timeline.start_at), end: formatDate(timeline.end_at) })}
                  </p>
                  {timeline.visible && (
                    <span className="prism-pill mt-3 border-emerald-200 bg-emerald-50 text-emerald-700">
                      {t('timelines.index.public')}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-stone-200 pt-4">
                  <Link href={`/timelines/${timeline.id}`} className="prism-link-emphasis text-sm">
                    {t('timelines.index.view')}
                  </Link>
                  <Link href={`/timelines/${timeline.id}/edit`} className="prism-link text-sm">
                    {t('timelines.index.edit')}
                  </Link>
                  <ActionButton
                    variant="soft"
                    onClick={() => handleDelete(timeline.id)}
                    disabled={deletingId === timeline.id}
                    className="px-0 py-0 text-sm text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-stone-400"
                  >
                    {deletingId === timeline.id ? t('timelines.index.deleting') : t('timelines.index.delete')}
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
