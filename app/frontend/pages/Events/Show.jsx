import { Head, Link, router } from '@inertiajs/react'
import Layout from '../Layout'
import { useTranslations } from '../../lib/useTranslations'
import {
  ActionButton,
  ActionLink,
  DefinitionList,
  PageFrame,
  PageSection,
} from '../../components/prism/PrismUI'

export default function Show({ event, can_edit, can_delete, current_user, flash }) {
  const t = useTranslations()

  const handleDelete = () => {
    if (confirm(t('events.show.delete_confirm'))) {
      router.delete(`/events/${event.id}`)
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={event.title} />

      <PageFrame>
        <div className="mb-6">
          <ActionLink href="/timelines" variant="secondary">
            &larr; {t('events.show.back')}
          </ActionLink>
        </div>

        <PageSection
          title={event.title}
          description={event.category}
          actions={(
            <div className="flex flex-wrap gap-3">
              {can_edit && (
                <Link
                  href={`/events/${event.id}/edit`}
                  className="prism-button prism-button-primary"
                >
                  {t('events.show.edit')}
                </Link>
              )}
              {can_delete && (
                <ActionButton variant="danger" onClick={handleDelete}>
                  {t('events.show.delete')}
                </ActionButton>
              )}
            </div>
          )}
          surfaceClassName="p-6 sm:p-8"
        >
          <DefinitionList
            items={[
              {
                label: t('events.show.description'),
                value: <span className="whitespace-pre-wrap">{event.description}</span>,
              },
              {
                label: t('events.show.start_date'),
                value: new Date(event.start_date).toLocaleString(),
              },
              {
                label: t('events.show.end_date'),
                value: new Date(event.end_date).toLocaleString(),
              },
              {
                label: t('events.show.created_by'),
                value: event.creator.email,
              },
              {
                label: t('events.show.created_at'),
                value: new Date(event.created_at).toLocaleString(),
              },
            ]}
          />
        </PageSection>
      </PageFrame>
    </Layout>
  )
}
