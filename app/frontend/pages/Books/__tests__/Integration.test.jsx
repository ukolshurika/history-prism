import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Index from '../Index'
import Form from '../Form'

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

describe('Books Integration Tests', () => {
  const mockCurrentUser = { id: 1, email: 'test@example.com' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Upload flow on Index page', () => {
    it('user sees upload form and selects a file, then sees filename appear', async () => {
      render(<Index books={[]} current_user={mockCurrentUser} flash={{}} errors={[]} />)

      // Upload form is visible
      expect(screen.getByRole('heading', { name: 'Upload Book' })).toBeInTheDocument()

      // Select a file via the hidden input (id=file-upload)
      const fileInput = document.getElementById('file-upload')
      const file = new File(['pdf content'], 'my-history.pdf', { type: 'application/pdf' })
      fireEvent.change(fileInput, { target: { files: [file] } })

      // Filename appears after selection
      expect(screen.getByText(/my-history\.pdf/)).toBeInTheDocument()
    })

    it('user fills in book name', async () => {
      const user = userEvent.setup()
      render(<Index books={[]} current_user={mockCurrentUser} flash={{}} errors={[]} />)

      const nameInput = screen.getByLabelText('Book Name (optional)')
      await user.type(nameInput, 'My Family Book')

      expect(nameInput).toHaveValue('My Family Book')
    })

    it('user submits form and router.post is called with FormData', () => {
      render(<Index books={[]} current_user={mockCurrentUser} flash={{}} errors={[]} />)

      // Select a file first so the button is enabled
      const fileInput = document.getElementById('file-upload')
      const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' })
      fireEvent.change(fileInput, { target: { files: [file] } })

      const form = document.querySelector('form')
      fireEvent.submit(form)

      expect(router.post).toHaveBeenCalledWith('/books', expect.any(FormData), expect.any(Object))
    })
  })

  describe('Delete flow', () => {
    const mockBooks = [
      {
        id: 42,
        name: 'Old Book',
        location: null,
        attachment_name: 'old.pdf',
        attachment_url: '/files/old.pdf',
        created_at: '2024-03-01T10:00:00Z',
        events_count: 2,
      },
    ]

    it('delete flow works with confirm dialog', () => {
      global.confirm = jest.fn(() => true)

      render(<Index books={mockBooks} current_user={mockCurrentUser} flash={{}} errors={[]} />)

      fireEvent.click(screen.getByText('Delete'))

      expect(global.confirm).toHaveBeenCalledWith(expect.stringContaining('Old Book'))
      expect(router.delete).toHaveBeenCalledWith('/books/42')
    })

    it('does not delete when confirm is cancelled', () => {
      global.confirm = jest.fn(() => false)

      render(<Index books={mockBooks} current_user={mockCurrentUser} flash={{}} errors={[]} />)

      fireEvent.click(screen.getByText('Delete'))

      expect(router.delete).not.toHaveBeenCalled()
    })
  })

  describe('Error messages', () => {
    it('error messages display when errors prop is passed to Index', () => {
      const errors = ['Attachment must be present', 'Invalid file type']

      render(<Index books={[]} current_user={mockCurrentUser} flash={{}} errors={errors} />)

      expect(screen.getByText('Attachment must be present')).toBeInTheDocument()
      expect(screen.getByText('Invalid file type')).toBeInTheDocument()
    })

    it('errors clear when rerendered with empty errors on Index', () => {
      const { rerender } = render(
        <Index books={[]} current_user={mockCurrentUser} flash={{}} errors={['Some error']} />
      )

      expect(screen.getByText('Some error')).toBeInTheDocument()

      rerender(<Index books={[]} current_user={mockCurrentUser} flash={{}} errors={[]} />)

      expect(screen.queryByText('Some error')).not.toBeInTheDocument()
    })

    it('error messages display when errors prop is passed to Form', () => {
      const errors = ['Attachment is required', 'Name is too long']

      render(
        <Form
          book={{ name: '', location: '', latitude: null, longitude: null }}
          current_user={mockCurrentUser}
          flash={{}}
          errors={errors}
          isEdit={false}
        />
      )

      expect(screen.getByText('Attachment is required')).toBeInTheDocument()
      expect(screen.getByText('Name is too long')).toBeInTheDocument()
      expect(screen.getByText(/There were 2 errors with your submission/i)).toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('shows empty state when no books', () => {
      render(<Index books={[]} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      expect(screen.getByText('No books uploaded yet.')).toBeInTheDocument()
    })

    it('does not show empty state when books exist', () => {
      const books = [
        {
          id: 1,
          name: 'Book A',
          location: null,
          attachment_name: 'a.pdf',
          attachment_url: '/files/a.pdf',
          created_at: '2024-01-01T10:00:00Z',
          events_count: 0,
        },
      ]
      render(<Index books={books} current_user={mockCurrentUser} flash={{}} errors={[]} />)
      expect(screen.queryByText('No books uploaded yet.')).not.toBeInTheDocument()
    })
  })

  describe('Books grid with multiple books', () => {
    const mockBooks = [
      {
        id: 1,
        name: 'Book One',
        location: 'London Library',
        attachment_name: 'book1.pdf',
        attachment_url: '/files/book1.pdf',
        created_at: '2024-01-15T10:00:00Z',
        events_count: 3,
      },
      {
        id: 2,
        name: 'Book Two',
        location: 'Paris Archive',
        attachment_name: 'book2.pdf',
        attachment_url: '/files/book2.pdf',
        created_at: '2024-02-20T10:00:00Z',
        events_count: 7,
      },
    ]

    it('shows multiple books correctly in grid', () => {
      render(<Index books={mockBooks} current_user={mockCurrentUser} flash={{}} errors={[]} />)

      expect(screen.getByText('Book One')).toBeInTheDocument()
      expect(screen.getByText('Book Two')).toBeInTheDocument()
      expect(screen.getByText('London Library')).toBeInTheDocument()
      expect(screen.getByText('Paris Archive')).toBeInTheDocument()
    })

    it('renders all action links for each book', () => {
      render(<Index books={mockBooks} current_user={mockCurrentUser} flash={{}} errors={[]} />)

      expect(screen.getAllByText('View Book')).toHaveLength(2)
      expect(screen.getAllByText('Download')).toHaveLength(2)
      expect(screen.getAllByText('Edit')).toHaveLength(2)
      expect(screen.getAllByText('Delete')).toHaveLength(2)
    })

    it('View Book links point to correct book URLs', () => {
      render(<Index books={mockBooks} current_user={mockCurrentUser} flash={{}} errors={[]} />)

      const viewLinks = screen.getAllByText('View Book').map((el) => el.closest('a'))
      expect(viewLinks[0]).toHaveAttribute('href', '/books/1')
      expect(viewLinks[1]).toHaveAttribute('href', '/books/2')
    })
  })
})
