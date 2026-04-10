import { Head, useForm, Link } from '@inertiajs/react'
import Layout from '../Layout'
import { useTranslations } from '../../lib/useTranslations'
import {
  ActionLink,
  PageFrame,
  PageSection,
} from '../../components/prism/PrismUI'

export default function Form({ person, events = [], isEdit, current_user, flash, errors = [] }) {
  const t = useTranslations()
  const { data, setData, post, put, processing } = useForm({
    person: {
      name: person.name || '',
      first_name: person.first_name || '',
      middle_name: person.middle_name || '',
      last_name: person.last_name || '',
      gedcom_uuid: person.gedcom_uuid || '',
      event_ids: person.event_ids || [],
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isEdit) {
      put(`/people/${person.id}`)
    } else {
      post('/people')
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={isEdit ? t('people.form.edit_title') : t('people.form.new_title')} />

      <PageFrame>
        <div className="mb-6">
          <ActionLink href="/people" variant="secondary">
            &larr; {t('people.form.back')}
          </ActionLink>
        </div>

        <PageSection
          title={isEdit ? t('people.form.edit_title') : t('people.form.new_title')}
          surfaceClassName="p-6 sm:p-8"
        >
          {errors.length > 0 && (
            <div className="mb-6 rounded-[20px] border border-red-200 bg-red-50 p-4">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">{error}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="prism-label">
                {t('people.form.name')} *
              </label>
              <input
                type="text"
                id="name"
                name="person[name]"
                value={data.person.name}
                onChange={(e) => setData('person.name', e.target.value)}
                className="prism-input"
                required
              />
            </div>

            <div>
              <label htmlFor="first_name" className="prism-label">
                {t('people.form.first_name')} *
              </label>
              <input
                type="text"
                id="first_name"
                name="person[first_name]"
                value={data.person.first_name}
                onChange={(e) => setData('person.first_name', e.target.value)}
                className="prism-input"
                required
              />
            </div>

            <div>
              <label htmlFor="middle_name" className="prism-label">
                {t('people.form.middle_name')}
              </label>
              <input
                type="text"
                id="middle_name"
                name="person[middle_name]"
                value={data.person.middle_name}
                onChange={(e) => setData('person.middle_name', e.target.value)}
                className="prism-input"
              />
            </div>

            <div>
              <label htmlFor="last_name" className="prism-label">
                {t('people.form.last_name')}
              </label>
              <input
                type="text"
                id="last_name"
                name="person[last_name]"
                value={data.person.last_name}
                onChange={(e) => setData('person.last_name', e.target.value)}
                className="prism-input"
              />
            </div>

            <div>
              <label htmlFor="gedcom_uuid" className="prism-label">
                {t('people.form.gedcom_uuid')} *
              </label>
              <input
                type="text"
                id="gedcom_uuid"
                name="person[gedcom_uuid]"
                value={data.person.gedcom_uuid}
                onChange={(e) => setData('person.gedcom_uuid', e.target.value)}
                className="prism-input font-mono"
                required
              />
              <p className="mt-2 text-xs leading-6 text-stone-500">
                {t('people.form.gedcom_uuid_hint')}
              </p>
            </div>

            <div>
              <label htmlFor="events" className="prism-label">
                {t('people.form.associated_events')}
              </label>
              <select
                id="events"
                name="person[event_ids][]"
                multiple
                value={data.person.event_ids}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                  setData('person.event_ids', selected)
                }}
                className="prism-select min-h-[120px]"
              >
                {events.length === 0 ? (
                  <option disabled>{t('people.form.no_person_events')}</option>
                ) : (
                  events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} ({new Date(event.start_date).toLocaleDateString()})
                    </option>
                  ))
                )}
              </select>
              <p className="mt-2 text-xs leading-6 text-stone-500">
                {t('people.form.associated_events_hint')}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={processing}
                className="prism-button prism-button-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing
                  ? (isEdit ? t('people.form.updating') : t('people.form.creating'))
                  : (isEdit ? t('people.form.update') : t('people.form.create'))}
              </button>
              <Link
                href="/people"
                className="prism-button prism-button-secondary flex-1 text-center"
              >
                {t('people.form.cancel')}
              </Link>
            </div>
          </form>
        </PageSection>
      </PageFrame>
    </Layout>
  )
}
