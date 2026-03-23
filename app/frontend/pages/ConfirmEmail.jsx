import { Head, useForm, Link } from '@inertiajs/react'
import Layout from './Layout'

export default function ConfirmEmail({ current_user, flash, email, sent, resend }) {
  const { data, setData, post, processing } = useForm({ email: email || '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    post('/confirmation')
  }

  const showResendForm = resend || (!email && !sent)
  const showCheckInbox = (email || sent) && !resend

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title="Confirm Email" />

      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          {showCheckInbox ? (
            <>
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">✉️</div>
                <h1 className="text-2xl font-bold mb-2">
                  {sent ? 'Письмо отправлено!' : 'Проверьте почту'}
                </h1>
              </div>

              <p className="text-gray-600 mb-4 text-center">
                {sent
                  ? 'Мы отправили новое письмо с подтверждением.'
                  : 'Мы отправили письмо с подтверждением.'}
                {email && (
                  <> Проверьте <strong>{email}</strong>.</>
                )}
              </p>

              <p className="text-gray-600 mb-6 text-center text-sm">
                Нажмите на ссылку в письме, чтобы подтвердить аккаунт.
                Ссылка действительна 24 часа.
              </p>

              <p className="text-sm text-gray-500 text-center">
                Не пришло письмо?{' '}
                <Link href="/confirmation/new" className="text-blue-600 hover:text-blue-700 font-medium">
                  Отправить повторно
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">Повторная отправка</h1>
              <p className="text-gray-600 mb-6 text-sm">
                Введите email, на который зарегистрированы, и мы пришлём новую ссылку подтверждения.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
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
                  {processing ? 'Отправляем...' : 'Отправить письмо'}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link href="/session/new" className="text-sm text-gray-500 hover:text-gray-700">
              Вернуться к входу
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
