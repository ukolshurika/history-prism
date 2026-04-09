import { render, screen, fireEvent } from '@testing-library/react'
import Index from '../Index'

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => <a href={href} className={className}>{children}</a>,
  usePage: () => ({ props: { yandex_maps_api_key: 'test-key' } }),
  router: {
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('../../../components/YandexMapPicker', () => {
  return function YandexMapPicker() {
    return <div data-testid="yandex-map-picker" />
  }
})

jest.mock('../../Layout', () => function Layout({ children }) {
  return <div data-testid="layout">{children}</div>
})

const { router } = require('@inertiajs/react')

describe('Books Index', () => {
  const mockCurrentUser = { id: 1, email: 'test@example.com' }

  const mockBooks = [
    {
      id: 1,
      name: 'Family History',
      location: 'New York Library',
      attachment_name: 'family.pdf',
      attachment_url: '/rails/active_storage/blobs/xyz/family.pdf',
      created_at: '2024-01-15T10:00:00Z',
      events_count: 5,
    },
    {
      id: 2,
      name: null,
      location: null,
      attachment_name: 'history-book.pdf',
      attachment_url: '/rails/active_storage/blobs/abc/history-book.pdf',
      created_at: '2024-01-20T10:00:00Z',
      events_count: 0,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "History Books" heading', () => {
    render(<Index books={[]} current_user={mockCurrentUser} flash={{}} errors={[]} />)
    expect(screen.getByText('History Books')).toBeInTheDocument()
  })

  describe('Upload Form - when current_user present', () => {
    it('shows "Upload Book" section', () => {
      render(<Index books={[]} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      expect(screen.getByRole('heading', { name: 'Upload Book' })).toBeInTheDocument()
    })

    it('shows "Book Name (optional)" label', () => {
      render(<Index books={[]} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      expect(screen.getByText('Book Name (optional)')).toBeInTheDocument()
    })

    it('shows "Choose PDF file" button', () => {
      render(<Index books={[]} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      expect(screen.getByText('Choose PDF file')).toBeInTheDocument()
    })

    it('Upload button is disabled when no attachment selected', () => {
      render(<Index books={[]} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      const submitButton = screen.getByRole('button', { name: /Upload Book/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Upload Form - when no current_user', () => {
    it('does not show upload form', () => {
      render(<Index books={[]} current_user={null} flash={{}} errors={[]} />)
      expect(screen.queryByRole('heading', { name: 'Upload Book' })).not.toBeInTheDocument()
    })
  })

  describe('Books List', () => {
    it('shows "No books uploaded yet." when books=[]', () => {
      render(<Index books={[]} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      expect(screen.getByText('No books uploaded yet.')).toBeInTheDocument()
    })

    it('renders book names when books present', () => {
      render(<Index books={mockBooks} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      expect(screen.getByText('Family History')).toBeInTheDocument()
      // Book with no name shows attachment_name
      expect(screen.getByText('history-book.pdf')).toBeInTheDocument()
    })

    it('renders Events count', () => {
      render(<Index books={mockBooks} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      expect(screen.getByText(/Events: 5/)).toBeInTheDocument()
      expect(screen.getByText(/Events: 0/)).toBeInTheDocument()
    })

    it('renders location when present', () => {
      render(<Index books={[mockBooks[0]]} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      expect(screen.getByText('New York Library')).toBeInTheDocument()
    })

    it('renders "Uploaded:" date', () => {
      render(<Index books={[mockBooks[0]]} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      expect(screen.getByText(/Uploaded:/)).toBeInTheDocument()
    })

    it('renders "View Book" link to /books/:id', () => {
      render(<Index books={[mockBooks[0]]} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      const viewLink = screen.getByText('View Book').closest('a')
      expect(viewLink).toHaveAttribute('href', '/books/1')
    })

    it('renders "Download" link with download attribute', () => {
      render(<Index books={[mockBooks[0]]} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      const downloadLink = screen.getByText('Download').closest('a')
      expect(downloadLink).toHaveAttribute('href', mockBooks[0].attachment_url)
      expect(downloadLink).toHaveAttribute('download')
    })

    it('renders "Edit" link to /books/:id/edit', () => {
      render(<Index books={[mockBooks[0]]} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      const editLink = screen.getByText('Edit').closest('a')
      expect(editLink).toHaveAttribute('href', '/books/1/edit')
    })

    it('renders "Delete" button', () => {
      render(<Index books={[mockBooks[0]]} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })
  })

  describe('Delete Functionality', () => {
    it('calls confirm() then router.delete on confirm', () => {
      global.confirm = jest.fn(() => true)

      render(<Index books={[mockBooks[0]]} current_user={mockCurrentUser} flash={{}} errors={[]} />)

      fireEvent.click(screen.getByText('Delete'))

      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Are you sure you want to delete "Family History"?')
      )
      expect(router.delete).toHaveBeenCalledWith('/books/1')
    })

    it('does NOT call router.delete when cancelled', () => {
      global.confirm = jest.fn(() => false)

      render(<Index books={[mockBooks[0]]} current_user={mockCurrentUser} flash={{}} errors={[]} />)

      fireEvent.click(screen.getByText('Delete'))

      expect(global.confirm).toHaveBeenCalled()
      expect(router.delete).not.toHaveBeenCalled()
    })
  })

  describe('Errors', () => {
    it('shows errors list when errors present', () => {
      const errors = ['Attachment must be a PDF file', 'Name is too long']
      render(<Index books={[]} current_user={mockCurrentUser} flash={{}} errors={errors} />)
      expect(screen.getByText('Attachment must be a PDF file')).toBeInTheDocument()
      expect(screen.getByText('Name is too long')).toBeInTheDocument()
    })
  })
})
