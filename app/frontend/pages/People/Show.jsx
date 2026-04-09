import { Head, Link, router } from '@inertiajs/react'
import Layout from '../Layout'
import { useTranslations } from '../../lib/useTranslations'
import {
  ActionButton,
  ActionLink,
  Card,
  DefinitionList,
  PageFrame,
  SectionIntro,
  SurfaceCard
} from '../../components/prism/PrismUI'

export default function Show({ person, can_edit, can_delete, current_user, flash }) {
  const t = useTranslations()
  const handleDelete = () => {
    if (confirm(t('people.show.delete_confirm'))) {
      router.delete(`/people/${person.id}`)
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={person.full_name} />

      <PageFrame>
        <div className="mb-6">
          <ActionLink href="/people" variant="secondary">
            &larr; {t('people.show.back')}
          </ActionLink>
        </div>

        <SectionIntro
          kicker={t('people.show.associated_events')}
          title={person.full_name}
          actions={(
            <>
              {can_edit && (
                <ActionLink href={`/people/${person.id}/edit`} variant="primary">
                  {t('people.show.edit')}
                </ActionLink>
              )}
              {can_delete && (
                <ActionButton variant="danger" onClick={handleDelete}>
                  {t('people.show.delete')}
                </ActionButton>
              )}
            </>
          )}
        />

        <SurfaceCard className="p-6 sm:p-8">
          <DefinitionList
            items={[
              { label: t('people.show.first_name'), value: person.first_name },
              ...(person.middle_name ? [{ label: t('people.show.middle_name'), value: person.middle_name }] : []),
              ...(person.last_name ? [{ label: t('people.show.last_name'), value: person.last_name }] : []),
              { label: t('people.show.gedcom_uuid'), value: <span className="font-mono">{person.gedcom_uuid}</span> },
              { label: t('people.show.created_at'), value: new Date(person.created_at).toLocaleString() },
              ...(person.updated_at ? [{ label: t('people.show.updated_at'), value: new Date(person.updated_at).toLocaleString() }] : [])
            ]}
          />

          {person.events && person.events.length > 0 && (
            <div className="mt-8">
              <h2 className="prism-kicker">{t('people.show.associated_events')}</h2>
              <div className="mt-4 grid gap-4">
                {person.events.map((event) => (
                  <Card key={event.id} className="p-5">
                    <Link href={`/events/${event.id}`} className="block">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-stone-900">{event.title}</h3>
                          <p className="mt-2 text-sm leading-7 text-stone-600">{event.description}</p>
                          {event.start_date_display && (
                            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-stone-500">
                              {event.start_date_display}
                            </p>
                          )}
                        </div>
                        <span className="prism-pill border-stone-300 bg-stone-100 text-stone-700">
                          {event.category}
                        </span>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </SurfaceCard>
      </PageFrame>
    </Layout>
  )
}
