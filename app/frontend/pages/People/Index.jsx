import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import Layout from '../Layout'
import { useTranslations } from '../../lib/useTranslations'
import {
  ActionLink,
  Card,
  EmptyState,
  PageFrame,
  SectionIntro,
  SurfaceCard
} from '../../components/prism/PrismUI'

export default function Index({ people, gedcom_files = [], current_user, flash, meta, filters = {} }) {
  const t = useTranslations()
  const q = filters.q || {}
  const pagination = meta
  const [searchFilters, setSearchFilters] = useState({
    name: q.name_cont || '',
    first_name: q.first_name_cont || '',
    middle_name: q.middle_name_cont || '',
    last_name: q.last_name_cont || '',
    gedcom_file_id: q.gedcom_file_id_eq || '',
  })

  const handleSearch = (e) => {
    e.preventDefault()

    const params = {}
    if (searchFilters.name) params['q[name_cont]'] = searchFilters.name
    if (searchFilters.first_name) params['q[first_name_cont]'] = searchFilters.first_name
    if (searchFilters.middle_name) params['q[middle_name_cont]'] = searchFilters.middle_name
    if (searchFilters.last_name) params['q[last_name_cont]'] = searchFilters.last_name
    if (searchFilters.gedcom_file_id) params['q[gedcom_file_id_eq]'] = searchFilters.gedcom_file_id

    router.get('/people', params, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const handleReset = () => {
    setSearchFilters({
      name: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      gedcom_file_id: '',
    })
    router.get('/people', {}, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const handleInputChange = (field, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePage = (page) => {
    const params = { page }
    if (q) {
      Object.entries(q).forEach(([k, v]) => { if (v) params[`q[${k}]`] = v })
    }
    router.get('/people', params, { preserveState: true, preserveScroll: false })
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={t('people.index.page_title')} />

      <PageFrame>
        <SectionIntro
          kicker={t('people.index.page_title')}
          title={t('people.index.heading')}
          actions={current_user && (
            <>
              <ActionLink href="/people/new" variant="primary">
                {t('people.index.add_person')}
              </ActionLink>
              <ActionLink
                href="/people/new"
                variant="primary"
                className="h-10 w-10 px-0 text-2xl font-light"
                title={t('people.index.add_person_title')}
              >
                +
              </ActionLink>
            </>
          )}
        />

        <SurfaceCard className="mb-6 p-6 sm:p-8">
          <h2 className="prism-kicker mb-4">{t('people.index.search_filters')}</h2>
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="name" className="prism-label">
                  {t('people.index.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  value={searchFilters.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="prism-input"
                  placeholder={t('people.index.name_placeholder')}
                />
              </div>
              <div>
                <label htmlFor="first_name" className="prism-label">
                  {t('people.index.first_name')}
                </label>
                <input
                  type="text"
                  id="first_name"
                  value={searchFilters.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="prism-input"
                  placeholder={t('people.index.first_name_placeholder')}
                />
              </div>
              <div>
                <label htmlFor="middle_name" className="prism-label">
                  {t('people.index.middle_name')}
                </label>
                <input
                  type="text"
                  id="middle_name"
                  value={searchFilters.middle_name}
                  onChange={(e) => handleInputChange('middle_name', e.target.value)}
                  className="prism-input"
                  placeholder={t('people.index.middle_name_placeholder')}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="prism-label">
                  {t('people.index.last_name')}
                </label>
                <input
                  type="text"
                  id="last_name"
                  value={searchFilters.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="prism-input"
                  placeholder={t('people.index.last_name_placeholder')}
                />
              </div>
              <div>
                <label htmlFor="gedcom_file_id" className="prism-label">
                  {t('people.index.gedcom_file')}
                </label>
                <select
                  id="gedcom_file_id"
                  value={searchFilters.gedcom_file_id}
                  onChange={(e) => handleInputChange('gedcom_file_id', e.target.value)}
                  className="prism-select"
                >
                  <option value="">{t('people.index.all_files')}</option>
                  {gedcom_files.map((file) => (
                    <option key={file.id} value={file.id}>
                      {file.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" className="prism-button prism-button-primary">
                {t('people.index.search')}
              </button>
              <button type="button" onClick={handleReset} className="prism-button prism-button-soft">
                {t('people.index.reset')}
              </button>
            </div>
          </form>
        </SurfaceCard>

        {people.length === 0 ? (
          <EmptyState
            title={t('people.index.empty_title')}
            action={current_user && (
              <div className="flex flex-col items-center gap-3">
                <ActionLink
                  href="/people/new"
                  variant="primary"
                  className="h-16 w-16 px-0 text-4xl font-light shadow-lg"
                  title={t('people.index.add_person_title')}
                >
                  +
                </ActionLink>
                <ActionLink href="/people/new" variant="secondary">
                  {t('people.index.empty_link')}
                </ActionLink>
              </div>
            )}
          />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
              {people.map((person) => (
                <Card key={person.id} className="p-6">
                  <Link href={`/people/${person.id}`} className="block">
                    <h2 className="text-xl font-semibold text-stone-900">{person.full_name}</h2>
                  </Link>
                  {person.first_name && (
                    <p className="mt-3 text-sm text-stone-600">
                      {t('people.index.first_name_value', { value: person.first_name })}
                    </p>
                  )}
                  {person.middle_name && (
                    <p className="mt-1 text-sm text-stone-600">
                      {t('people.index.middle_name_value', { value: person.middle_name })}
                    </p>
                  )}
                  {person.last_name && (
                    <p className="mt-1 text-sm text-stone-600">
                      {t('people.index.last_name_value', { value: person.last_name })}
                    </p>
                  )}
                  {(person.birth_year || person.death_year) && (
                    <div className="mt-4">
                      <span className="prism-pill">{person.birth_year || '?'} – {person.death_year || '?'}</span>
                    </div>
                  )}
                  {person.events && person.events.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm text-stone-500">
                        {person.events.length === 1
                          ? t('people.index.event_singular', { count: person.events.length })
                          : t('people.index.event_plural', { count: person.events.length })}
                      </span>
                    </div>
                  )}
                  <div className="mt-4 space-y-2">
                    {person.timelines && person.timelines.length > 0 && person.timelines.map((timeline) => (
                      <Link
                        key={timeline.id}
                        href={`/timelines/${timeline.id}`}
                        className="flex items-center gap-2 text-sm text-stone-700 transition hover:text-stone-950"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg width="17" height="15" viewBox="0 0 34 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.09 16.6667C23.7017 16.6667 25.0067 17.9733 25.0067 19.5833V27.0833C25.0067 27.8569 24.6994 28.5987 24.1524 29.1457C23.6054 29.6927 22.8635 30 22.09 30H2.92333C2.14979 30 1.40792 29.6927 0.860939 29.1457C0.313958 28.5987 0.00666658 27.8569 0.00666658 27.0833V19.5833C0.00666658 17.9733 1.31333 16.6667 2.92333 16.6667H22.09ZM31.6733 19.8317V28.75C31.6732 29.0667 31.5529 29.3716 31.3367 29.603C31.1205 29.8344 30.8245 29.9751 30.5085 29.9967C30.1926 30.0183 29.8802 29.9191 29.6345 29.7193C29.3888 29.5194 29.2282 29.2337 29.185 28.92L29.1733 28.75V19.8533C29.9951 20.0579 30.8553 20.0505 31.6733 19.8317ZM22.09 19.1667H2.92333C2.81283 19.1667 2.70685 19.2106 2.62871 19.2887C2.55057 19.3668 2.50667 19.4728 2.50667 19.5833V27.0833C2.50667 27.3133 2.69333 27.5 2.92333 27.5H22.09C22.2005 27.5 22.3065 27.4561 22.3846 27.378C22.4628 27.2998 22.5067 27.1938 22.5067 27.0833V19.5833C22.5067 19.4728 22.4628 19.3668 22.3846 19.2887C22.3065 19.2106 22.2005 19.1667 22.09 19.1667ZM30.4233 11.82C31.2667 11.82 32.0756 12.155 32.6719 12.7514C33.2683 13.3478 33.6033 14.1566 33.6033 15C33.6033 15.8434 33.2683 16.6522 32.6719 17.2486C32.0756 17.845 31.2667 18.18 30.4233 18.18C29.5799 18.18 28.7711 17.845 28.1747 17.2486C27.5784 16.6522 27.2433 15.8434 27.2433 15C27.2433 14.1566 27.5784 13.3478 28.1747 12.7514C28.7711 12.155 29.5799 11.82 30.4233 11.82ZM22.0833 1.0428e-06C23.695 1.0428e-06 25 1.30667 25 2.91667V10.4167C25 11.1902 24.6927 11.9321 24.1457 12.4791C23.5987 13.026 22.8569 13.3333 22.0833 13.3333H2.91667C2.14312 13.3333 1.40125 13.026 0.854272 12.4791C0.307291 11.9321 0 11.1902 0 10.4167V2.91667C6.1778e-05 2.18442 0.275552 1.47898 0.771746 0.940488C1.26794 0.401991 1.94853 0.0698362 2.67833 0.0100011L2.91667 1.0428e-06H22.0833ZM22.0833 2.5H2.91667L2.82167 2.51167C2.73027 2.53307 2.64877 2.58471 2.59039 2.65822C2.53201 2.73173 2.50016 2.8228 2.5 2.91667V10.4167C2.5 10.6467 2.68667 10.8333 2.91667 10.8333H22.0833C22.1938 10.8333 22.2998 10.7894 22.378 10.7113C22.4561 10.6332 22.5 10.5272 22.5 10.4167V2.91667C22.5 2.80616 22.4561 2.70018 22.378 2.62204C22.2998 2.5439 22.1938 2.5 22.0833 2.5ZM30.4233 1.0428e-06C30.7257 -0.000389305 31.0179 0.108821 31.2459 0.307398C31.4739 0.505976 31.6222 0.78046 31.6633 1.08L31.6733 1.25V10.1683C30.8553 9.94952 29.9951 9.94207 29.1733 10.1467V1.25C29.1733 0.91848 29.305 0.600538 29.5394 0.366117C29.7739 0.131697 30.0918 1.0428e-06 30.4233 1.0428e-06Z" fill="currentColor"/>
                        </svg>
                        <span>{timeline.title}</span>
                      </Link>
                    ))}
                    <Link
                      href={`/timelines/new?person_id=${person.id}`}
                      className="flex items-center gap-2 text-sm text-stone-700 transition hover:text-stone-950"
                    >
                      <svg width="17" height="15" viewBox="0 0 34 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 0C17.6904 0 18.25 0.559644 18.25 1.25V13.75H30.75C31.4404 13.75 32 14.3096 32 15C32 15.6904 31.4404 16.25 30.75 16.25H18.25V28.75C18.25 29.4404 17.6904 30 17 30C16.3096 30 15.75 29.4404 15.75 28.75V16.25H3.25C2.55964 16.25 2 15.6904 2 15C2 14.3096 2.55964 13.75 3.25 13.75H15.75V1.25C15.75 0.559644 16.3096 0 17 0Z" fill="currentColor" />
                      </svg>
                      <span>{t('people.index.new_timeline')}</span>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {pagination && pagination.total_pages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-stone-600">
                  {t('people.index.total', { count: pagination.total })}
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
                          p === pagination.page ? 'prism-button-primary' : 'prism-button-secondary'
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
