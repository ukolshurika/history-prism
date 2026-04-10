import { Head, useForm, Link } from '@inertiajs/react'
import Layout from './Layout'
import { useTranslations } from '../lib/useTranslations'
import { CenteredPage } from '../components/prism/PrismUI'

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

      <CenteredPage
        title={t('reset_password.title')}
        footer={(
          <Link href="/session/new" className="text-sm font-medium text-stone-800 underline underline-offset-4">
            {t('reset_password.back_to_login')}
          </Link>
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="prism-label">
              {t('reset_password.password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              className="prism-input"
              required
              autoFocus
            />
            <p className="mt-2 text-xs leading-6 text-stone-500">
              {t('reset_password.password_hint')}
            </p>
          </div>

          <div>
            <label htmlFor="password_confirmation" className="prism-label">
              {t('reset_password.password_confirmation')}
            </label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
              className="prism-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="prism-button prism-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? t('reset_password.submitting') : t('reset_password.submit')}
          </button>
        </form>
      </CenteredPage>
    </Layout>
  )
}
