import { Head, Link, useForm } from '@inertiajs/react'
import Layout from '../Layout'
import { useState } from 'react'

export default function Index({ gedcom_files, current_user, flash, errors }) {
  const { data, setData, post, processing, reset } = useForm({
    file: null,
  })
  const [selectedFileName, setSelectedFileName] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setData('file', file)
    setSelectedFileName(file ? file.name : '')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    post('/gedcom_files', {
      onSuccess: () => {
        reset()
        setSelectedFileName('')
      },
    })
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title="GEDCOM Files" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">GEDCOM Files</h1>

            {/* Upload Form */}
            {current_user && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload GEDCOM File</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <span>Choose .ged file</span>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".ged"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={processing}
                      />
                    </label>
                    {selectedFileName && (
                      <span className="ml-3 text-sm text-gray-600">
                        Selected: {selectedFileName}
                      </span>
                    )}
                  </div>

                  {errors && errors.length > 0 && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                      <ul className="list-disc list-inside text-red-700">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!data.file || processing}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {processing ? 'Uploading...' : 'Upload'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Files List */}
          {gedcom_files.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 mb-4">No GEDCOM files uploaded yet.</p>
              {current_user && (
                <p className="text-sm text-gray-400">
                  Upload your first GEDCOM file above to get started.
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gedcom_files.map((gedcom_file) => (
                <div
                  key={gedcom_file.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
                        {gedcom_file.file_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Uploaded: {new Date(gedcom_file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {gedcom_file.file_url && (
                    <a
                      href={gedcom_file.file_url}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mt-2"
                      download
                    >
                      Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
