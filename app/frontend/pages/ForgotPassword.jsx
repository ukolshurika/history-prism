import { Head, useForm, Link } from '@inertiajs/react'
import Layout from './Layout'
import { useTranslations } from '../lib/useTranslations'
import { CenteredPage } from '../components/prism/PrismUI'

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

      <CenteredPage
        title={sent ? t('forgot_password.sent_title') : t('forgot_password.title')}
        description={sent ? t('forgot_password.sent_description') : t('forgot_password.description')}
        footer={(
          <Link href="/session/new" className="text-sm font-medium text-stone-800 underline underline-offset-4">
            {t('forgot_password.back_to_login')}
          </Link>
        )}
      >
        {sent ? (
          <div className="space-y-4 text-center">
            <div className="text-5xl">✉️</div>
            <p className="text-sm leading-7 text-stone-600">
              {t('forgot_password.sent_expiry')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="prism-label">
                {t('forgot_password.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="prism-input"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="prism-button prism-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? t('forgot_password.submitting') : t('forgot_password.submit')}
            </button>
          </form>
        )}
      </CenteredPage>
    </Layout>
  )
}
