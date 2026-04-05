import { Head, useForm, Link } from '@inertiajs/react'
import Layout from './Layout'
import { useTranslations } from '../lib/useTranslations'

export default function Login({ current_user, flash }) {
  const t = useTranslations()
  const { data, setData, post, processing } = useForm({
    email: '',
    password: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    post('/session')
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={t('login.title')} />

      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6">{t('login.title')}</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('login.email')}
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

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('login.password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {processing ? t('login.submitting') : t('login.submit')}
            </button>

            <div className="text-center text-sm text-gray-600 mb-3">
              <Link href="/passwords/new" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('login.forgot_password')}
              </Link>
            </div>

            <div className="text-center text-sm text-gray-600">
              {t('login.no_account')}{' '}
              <Link href="/registration/new" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('login.sign_up')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
