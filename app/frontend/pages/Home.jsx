import { Head } from '@inertiajs/react'
import Layout from './Layout'
import { useTranslations } from '../lib/useTranslations'

export default function Home({ current_user, flash }) {
  const t = useTranslations()

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={t('home.title')} />

      <div className="flex items-center justify-center mt-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('home.welcome')}
          </h2>
          {current_user && (
            <p className="text-gray-600">
              {t('home.logged_in_as', { email: current_user.email })}
            </p>
          )}
        </div>
      </div>
    </Layout>
  )
}
