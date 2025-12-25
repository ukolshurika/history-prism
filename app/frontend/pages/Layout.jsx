import { Link, router } from '@inertiajs/react'

export default function Layout({ children, current_user, flash = {} }) {
  const handleLogout = (e) => {
    e.preventDefault()
    router.delete('/session')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
              History Prism
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/people"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                People
              </Link>
              <Link
                href="/timelines"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Timelines
              </Link>
              <Link
                href="/gedcom_files"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                GEDCOM Files
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {current_user ? (
                <>
                  <span className="text-sm text-gray-600">
                    {current_user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/session/new"
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/registration/new"
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Flash Messages */}
      {(flash.alert || flash.notice) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          {flash.alert && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
              <p className="text-red-800 text-sm font-medium">{flash.alert}</p>
            </div>
          )}

          {flash.notice && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
              <p className="text-green-800 text-sm font-medium">{flash.notice}</p>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  )
}
