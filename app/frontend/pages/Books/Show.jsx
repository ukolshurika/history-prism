import { Head, Link, router } from '@inertiajs/react'
import Layout from '../Layout'
import { useTranslations } from '../../lib/useTranslations'
import {
  ActionButton,
  ActionLink,
  DefinitionList,
  PageFrame,
  PageSection,
} from '../../components/prism/PrismUI'

export default function Show({ book, can_edit, can_delete, current_user, flash }) {
  const t = useTranslations()

  const handleDelete = () => {
    if (confirm(t('books.index.delete_confirm', { name: book.name || book.attachment_name }))) {
      router.delete(`/books/${book.id}`)
    }
  }

  return (
    <Layout current_user={current_user} flash={flash}>
      <Head title={book.name || book.attachment_name} />

      <PageFrame>
        <div className="mb-6">
          <ActionLink href="/books" variant="secondary">
            &larr; {t('books.show.back')}
          </ActionLink>
        </div>

        <PageSection
          title={book.name || book.attachment_name}
          description={t('books.show.uploaded_on', { date: new Date(book.created_at).toLocaleDateString() })}
          actions={(
            <div className="flex flex-wrap gap-3">
              {book.attachment_url && (
                <a
                  href={book.attachment_url}
                  download
                  className="prism-button prism-button-secondary"
                >
                  {t('books.show.download')}
                </a>
              )}
              {can_edit && (
                <Link
                  href={`/books/${book.id}/edit`}
                  className="prism-button prism-button-primary"
                >
                  {t('books.show.edit')}
                </Link>
              )}
              {can_delete && (
                <ActionButton variant="danger" onClick={handleDelete}>
                  {t('books.show.delete')}
                </ActionButton>
              )}
            </div>
          )}
          surfaceClassName="p-6 sm:p-8"
        >
          <DefinitionList
            items={[
              { label: t('books.show.location'), value: book.location || t('books.show.no_location') },
              { label: t('books.show.events_count'), value: book.events_count || 0 },
              { label: t('books.show.file'), value: book.attachment_name },
            ]}
          />
        </PageSection>
      </PageFrame>
    </Layout>
  )
}
