import { Head } from '@inertiajs/react'
import Layout from './Layout'

export default function Home({ current_user, flash }) {
  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title="History Prism" />

      <div className="flex items-center justify-center mt-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Welcome to History Prism!
          </h2>
          {current_user && (
            <p className="text-gray-600">
              You are logged in as {current_user.email}
            </p>
          )}
        </div>
      </div>
    </Layout>
  )
}
