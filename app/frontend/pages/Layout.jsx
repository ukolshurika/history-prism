import { Link, router } from '@inertiajs/react'
import { useTranslations } from '../lib/useTranslations'

export default function Layout({ children, current_user, flash = {}, immersive = false }) {
  const t = useTranslations()

  const handleLogout = (e) => {
    e.preventDefault()
    router.delete('/session')
  }

  return (
    <div className={immersive ? 'min-h-screen bg-stone-950 text-stone-100' : 'min-h-screen bg-gray-50'}>
      {/* Navigation Bar */}
      <nav
        className={
          immersive
            ? 'sticky top-0 z-40 border-b border-white/10 bg-stone-950/70 backdrop-blur-xl'
            : 'bg-white shadow-sm border-b'
        }
      >
        <div className={immersive ? 'mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className={
                immersive
                  ? 'text-xl font-semibold tracking-[0.08em] text-stone-100 transition hover:text-stone-300'
                  : 'text-xl font-bold text-gray-900 hover:text-gray-700'
              }
            >
              {t('layout.brand')}
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/people"
                className={
                  immersive
                    ? 'text-sm font-medium text-stone-300 transition-colors hover:text-white'
                    : 'text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors'
                }
              >
                {t('layout.nav.people')}
              </Link>
              <Link
                href="/timelines"
                className={
                  immersive
                    ? 'text-sm font-medium text-stone-200 transition-colors hover:text-white'
                    : 'text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors'
                }
              >
                {t('layout.nav.timelines')}
              </Link>
              <Link
                href="/books"
                className={
                  immersive
                    ? 'text-sm font-medium text-stone-300 transition-colors hover:text-white'
                    : 'text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors'
                }
              >
                {t('layout.nav.books')}
              </Link>
              <Link
                href="/gedcom_files"
                className={
                  immersive
                    ? 'text-sm font-medium text-stone-300 transition-colors hover:text-white'
                    : 'text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors'
                }
              >
                {t('layout.nav.gedcom_files')}
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {current_user ? (
                <>
                  <span className={immersive ? 'text-sm text-stone-400' : 'text-sm text-gray-600'}>
                    {current_user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className={
                      immersive
                        ? 'rounded-full border border-white/15 px-4 py-2 text-sm text-stone-100 transition hover:bg-white/8'
                        : 'px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors'
                    }
                  >
                    {t('layout.auth.sign_out')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/session/new"
                    className={
                      immersive
                        ? 'px-4 py-2 text-sm text-stone-300 transition-colors hover:text-white'
                        : 'px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors'
                    }
                  >
                    {t('layout.auth.sign_in')}
                  </Link>
                  <Link
                    href="/registration/new"
                    className={
                      immersive
                        ? 'rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-950 transition hover:bg-white'
                        : 'px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                    }
                  >
                    {t('layout.auth.sign_up')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Flash Messages */}
      {(flash.alert || flash.notice) && (
        <div className={immersive ? 'mx-auto mt-4 max-w-[1600px] px-4 sm:px-6 lg:px-10' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4'}>
          {flash.alert && (
            <div className={immersive ? 'mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4' : 'mb-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm'}>
              <p className={immersive ? 'text-sm font-medium text-red-100' : 'text-red-800 text-sm font-medium'}>{flash.alert}</p>
            </div>
          )}

          {flash.notice && (
            <div className={immersive ? 'mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4' : 'mb-4 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm'}>
              <p className={immersive ? 'text-sm font-medium text-emerald-100' : 'text-green-800 text-sm font-medium'}>{flash.notice}</p>
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
