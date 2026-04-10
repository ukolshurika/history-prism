import { Head } from '@inertiajs/react'
import Layout from './Layout'
import { useTranslations } from '../lib/useTranslations'
import { PageFrame, PageSection } from '../components/prism/PrismUI'

export default function Home({ current_user, flash }) {
  const t = useTranslations()

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={t('home.title')} />

      <PageFrame>
        <PageSection
          kicker={t('layout.brand')}
          title={t('home.welcome')}
          surfaceClassName="p-8 sm:p-10"
        >
          <div className="text-center">
            {current_user ? (
              <p className="text-sm leading-7 text-stone-600">
                {t('home.logged_in_as', { email: current_user.email })}
              </p>
            ) : (
              <p className="text-sm leading-7 text-stone-600">
                {t('home.title')}
              </p>
            )}
          </div>
        </PageSection>
      </PageFrame>
    </Layout>
  )
}
