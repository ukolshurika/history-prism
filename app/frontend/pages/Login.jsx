import { Head, useForm, Link } from '@inertiajs/react'
import Layout from './Layout'
import { useTranslations } from '../lib/useTranslations'
import { CenteredPage } from '../components/prism/PrismUI'

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

      <CenteredPage
        title={t('login.title')}
        footer={(
          <div className="space-y-3 text-sm text-stone-600">
            <div>
              <Link href="/passwords/new" className="font-medium text-stone-800 underline underline-offset-4">
                {t('login.forgot_password')}
              </Link>
            </div>
            <div>
              {t('login.no_account')}{' '}
              <Link href="/registration/new" className="font-medium text-stone-800 underline underline-offset-4">
                {t('login.sign_up')}
              </Link>
            </div>
          </div>
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="prism-label">
              {t('login.email')}
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

          <div>
            <label htmlFor="password" className="prism-label">
              {t('login.password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              className="prism-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="prism-button prism-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? t('login.submitting') : t('login.submit')}
          </button>
        </form>
      </CenteredPage>
    </Layout>
  )
}
