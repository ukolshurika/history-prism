import { Head, useForm, Link } from '@inertiajs/react'
import Layout from './Layout'
import { useTranslations } from '../lib/useTranslations'
import { CenteredPage } from '../components/prism/PrismUI'

export default function ConfirmEmail({ current_user, flash, email, sent, resend }) {
  const t = useTranslations()
  const { data, setData, post, processing } = useForm({ email: email || '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    post('/confirmation')
  }

  const showResendForm = resend || (!email && !sent)
  const showCheckInbox = (email || sent) && !resend

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={t('confirm_email.title')} />

      <CenteredPage
        title={showCheckInbox ? (sent ? t('confirm_email.sent_title') : t('confirm_email.check_inbox_title')) : t('confirm_email.resend_title')}
        description={
          showCheckInbox
            ? (sent ? t('confirm_email.resent_description') : t('confirm_email.sent_description'))
            : t('confirm_email.resend_description')
        }
        footer={(
          <Link href="/session/new" className="text-sm font-medium text-stone-800 underline underline-offset-4">
            {t('confirm_email.back_to_login')}
          </Link>
        )}
      >
        {showCheckInbox ? (
          <div className="space-y-4 text-center">
            <div className="text-5xl">✉️</div>
            {email && (
              <strong className="block text-sm font-medium leading-7 text-stone-900">
                {email}
              </strong>
            )}
            <p className="text-sm leading-7 text-stone-600">
              {t('confirm_email.instructions')}
            </p>
            <p className="text-sm text-stone-500">
              {t('confirm_email.missing_email')}{' '}
              <Link href="/confirmation/new" className="font-medium text-stone-800 underline underline-offset-4">
                {t('confirm_email.resend_link')}
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="prism-label">
                {t('confirm_email.email')}
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
              {processing ? t('confirm_email.submitting') : t('confirm_email.submit')}
            </button>
          </form>
        )}
      </CenteredPage>
    </Layout>
  )
}
