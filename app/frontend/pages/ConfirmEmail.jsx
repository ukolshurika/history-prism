import { Head, useForm, Link } from '@inertiajs/react'
import Layout from './Layout'
import { useTranslations } from '../lib/useTranslations'

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

      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          {showCheckInbox ? (
            <>
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">✉️</div>
                <h1 className="text-2xl font-bold mb-2">
                  {sent ? t('confirm_email.sent_title') : t('confirm_email.check_inbox_title')}
                </h1>
              </div>

              <p className="text-gray-600 mb-4 text-center">
                {sent
                  ? t('confirm_email.resent_description')
                  : t('confirm_email.sent_description')}
                {email && (
                  <> <strong>{t('confirm_email.check_email', { email })}</strong></>
                )}
              </p>

              <p className="text-gray-600 mb-6 text-center text-sm">
                {t('confirm_email.instructions')}
              </p>

              <p className="text-sm text-gray-500 text-center">
                {t('confirm_email.missing_email')}{' '}
                <Link href="/confirmation/new" className="text-blue-600 hover:text-blue-700 font-medium">
                  {t('confirm_email.resend_link')}
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">{t('confirm_email.resend_title')}</h1>
              <p className="text-gray-600 mb-6 text-sm">
                {t('confirm_email.resend_description')}
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('confirm_email.email')}
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
                  {processing ? t('confirm_email.submitting') : t('confirm_email.submit')}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link href="/session/new" className="text-sm text-gray-500 hover:text-gray-700">
              {t('confirm_email.back_to_login')}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
