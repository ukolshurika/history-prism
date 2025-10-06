import { Head, useForm } from '@inertiajs/react'

export default function Registration({ errors = [] }) {
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
    <>
      <Head title="Sign Up" />

      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6">Sign Up</h1>

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              {errors.map((error, index) => (
                <p key={index} className="text-red-600 text-sm">{error}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="user[email]"
                value={data.user.email}
                onChange={(e) => setData('user.email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="user[password]"
                value={data.user.password}
                onChange={(e) => setData('user.password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="password_confirmation"
                name="user[password_confirmation]"
                value={data.user.password_confirmation}
                onChange={(e) => setData('user.password_confirmation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
