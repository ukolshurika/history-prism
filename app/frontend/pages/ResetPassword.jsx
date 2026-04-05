import { Head, useForm, Link } from '@inertiajs/react'
import Layout from './Layout'
import { useTranslations } from '../lib/useTranslations'

export default function ResetPassword({ current_user, flash, token }) {
  const t = useTranslations()
  const { data, setData, put, processing, errors } = useForm({
    password: '',
    password_confirmation: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    put(`/passwords/${token}`)
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={t('reset_password.title')} />

      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6">{t('reset_password.title')}</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('reset_password.password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('reset_password.password_hint')}
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                {t('reset_password.password_confirmation')}
              </label>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? t('reset_password.submitting') : t('reset_password.submit')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/session/new" className="text-sm text-gray-500 hover:text-gray-700">
              {t('reset_password.back_to_login')}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
