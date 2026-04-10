import { Head, Link, useForm } from '@inertiajs/react'
import Layout from './Layout'
import { useTranslations } from '../lib/useTranslations'
import { CenteredPage } from '../components/prism/PrismUI'

export default function Registration({ current_user, flash, errors = [] }) {
  const t = useTranslations()
  const { data, setData, post, processing } = useForm({
    user: {
      email: '',
      password: '',
      password_confirmation: '',
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    post('/registration')
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={t('registration.title')} />

      <CenteredPage
        title={t('registration.title')}
        footer={(
          <Link href="/session/new" className="text-sm font-medium text-stone-800 underline underline-offset-4">
            {t('registration.back_to_login')}
          </Link>
        )}
      >
        {errors.length > 0 && (
          <div className="rounded-[20px] border border-red-200 bg-red-50 p-4">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">{error}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="prism-label">
              {t('registration.email')}
            </label>
            <input
              type="email"
              id="email"
              name="user[email]"
              value={data.user.email}
              onChange={(e) => setData('user.email', e.target.value)}
              className="prism-input"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="prism-label">
              {t('registration.password')}
            </label>
            <input
              type="password"
              id="password"
              name="user[password]"
              value={data.user.password}
              onChange={(e) => setData('user.password', e.target.value)}
              className="prism-input"
              required
            />
          </div>

          <div>
            <label htmlFor="password_confirmation" className="prism-label">
              {t('registration.password_confirmation')}
            </label>
            <input
              type="password"
              id="password_confirmation"
              name="user[password_confirmation]"
              value={data.user.password_confirmation}
              onChange={(e) => setData('user.password_confirmation', e.target.value)}
              className="prism-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="prism-button prism-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? t('registration.submitting') : t('registration.submit')}
          </button>
        </form>
      </CenteredPage>
    </Layout>
  )
}
