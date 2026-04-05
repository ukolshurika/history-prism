import { Head, useForm, Link } from '@inertiajs/react'
import Layout from './Layout'
import { useTranslations } from '../lib/useTranslations'

export default function ForgotPassword({ current_user, flash, sent }) {
  const t = useTranslations()
  const { data, setData, post, processing } = useForm({ email: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    post('/passwords')
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={t('forgot_password.title')} />

      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          {sent ? (
            <>
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">✉️</div>
                <h1 className="text-2xl font-bold mb-2">{t('forgot_password.sent_title')}</h1>
              </div>
              <p className="text-gray-600 mb-6 text-center">
                {t('forgot_password.sent_description')}
              </p>
              <p className="text-gray-500 text-sm text-center">
                {t('forgot_password.sent_expiry')}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">{t('forgot_password.title')}</h1>
              <p className="text-gray-600 mb-6 text-sm">
                {t('forgot_password.description')}
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('forgot_password.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? t('forgot_password.submitting') : t('forgot_password.submit')}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link href="/session/new" className="text-sm text-gray-500 hover:text-gray-700">
              {t('forgot_password.back_to_login')}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
