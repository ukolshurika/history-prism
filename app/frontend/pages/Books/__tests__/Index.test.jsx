import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Index from '../Index'

// Mock Inertia
const mockPost = jest.fn()
const mockDelete = jest.fn()

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  useForm: () => ({
    data: {
      attachment: null,
      name: '',
      location: '',
    },
    setData: jest.fn(),
    post: mockPost,
    processing: false,
    reset: jest.fn(),
  }),
  router: {
    delete: mockDelete,
  },
}))

// Mock Layout
jest.mock('../../Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

describe('Books Index', () => {
  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  }

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

  describe('Rendering', () => {
    it('renders the page title', () => {
      render(
        <Index
          books={[]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByText('History Books')).toBeInTheDocument()
    })

    it('renders upload form when user is logged in', () => {
      render(
        <Index
          books={[]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByText('Upload Book')).toBeInTheDocument()
      expect(screen.getByLabelText(/Book Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Location/i)).toBeInTheDocument()
      expect(screen.getByText('Choose PDF file')).toBeInTheDocument()
    })

    it('does not render upload form when user is not logged in', () => {
      render(
        <Index
          books={[]}
          current_user={null}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.queryByText('Upload Book')).not.toBeInTheDocument()
    })

    it('displays empty state when no books exist', () => {
      render(
        <Index
          books={[]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByText('No books uploaded yet.')).toBeInTheDocument()
      expect(
        screen.getByText(/Upload your first book above to extract historical events/i)
      ).toBeInTheDocument()
    })

    it('displays books in grid when books exist', () => {
      render(
        <Index
          books={mockBooks}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByText('Family History')).toBeInTheDocument()
      expect(screen.getByText('history-book.pdf')).toBeInTheDocument()
      expect(screen.getByText('New York Library')).toBeInTheDocument()
    })

    it('displays book with name when provided', () => {
      render(
        <Index
          books={[mockBooks[0]]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByText('Family History')).toBeInTheDocument()
    })

    it('displays filename when book name is not provided', () => {
      render(
        <Index
          books={[mockBooks[1]]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByText('history-book.pdf')).toBeInTheDocument()
    })

    it('displays events count', () => {
      render(
        <Index
          books={mockBooks}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByText(/Events: 5/)).toBeInTheDocument()
      expect(screen.getByText(/Events: 0/)).toBeInTheDocument()
    })

    it('displays location when provided', () => {
      render(
        <Index
          books={[mockBooks[0]]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByText('New York Library')).toBeInTheDocument()
    })

    it('displays upload date', () => {
      render(
        <Index
          books={[mockBooks[0]]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByText(/Uploaded:/)).toBeInTheDocument()
    })
  })

  describe('Action Links', () => {
    it('renders View Events link with correct href', () => {
      render(
        <Index
          books={[mockBooks[0]]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      const viewLink = screen.getByText('View Events').closest('a')
      expect(viewLink).toHaveAttribute('href', '/books/1')
    })

    it('renders Download link when attachment_url exists', () => {
      render(
        <Index
          books={[mockBooks[0]]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      const downloadLink = screen.getByText('Download').closest('a')
      expect(downloadLink).toHaveAttribute('href', mockBooks[0].attachment_url)
      expect(downloadLink).toHaveAttribute('download')
    })

    it('renders Edit link with correct href', () => {
      render(
        <Index
          books={[mockBooks[0]]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      const editLink = screen.getByText('Edit').closest('a')
      expect(editLink).toHaveAttribute('href', '/books/1/edit')
    })

    it('renders Delete button', () => {
      render(
        <Index
          books={[mockBooks[0]]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByText('Delete')).toBeInTheDocument()
    })
  })

  describe('Delete Functionality', () => {
    it('shows confirmation dialog when delete is clicked', () => {
      global.confirm = jest.fn(() => true)

      render(
        <Index
          books={[mockBooks[0]]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      const deleteButton = screen.getByText('Delete')
      fireEvent.click(deleteButton)

      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Are you sure you want to delete "Family History"?')
      )
      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('This will also delete all associated events.')
      )
    })

    it('calls router.delete when user confirms deletion', () => {
      global.confirm = jest.fn(() => true)

      render(
        <Index
          books={[mockBooks[0]]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      const deleteButton = screen.getByText('Delete')
      fireEvent.click(deleteButton)

      expect(mockDelete).toHaveBeenCalledWith('/books/1')
    })

    it('does not call router.delete when user cancels deletion', () => {
      global.confirm = jest.fn(() => false)

      render(
        <Index
          books={[mockBooks[0]]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      const deleteButton = screen.getByText('Delete')
      fireEvent.click(deleteButton)

      expect(mockDelete).not.toHaveBeenCalled()
    })

    it('uses filename in confirmation when book name is not provided', () => {
      global.confirm = jest.fn(() => true)

      render(
        <Index
          books={[mockBooks[1]]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      const deleteButton = screen.getByText('Delete')
      fireEvent.click(deleteButton)

      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('history-book.pdf')
      )
    })
  })

  describe('Upload Form', () => {
    it('displays validation errors when present', () => {
      const errors = ['Attachment must be a PDF file', 'Name is too long']

      render(
        <Index
          books={[]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={errors}
        />
      )

      expect(screen.getByText('Attachment must be a PDF file')).toBeInTheDocument()
      expect(screen.getByText('Name is too long')).toBeInTheDocument()
    })

    it('has submit button disabled when no file is selected', () => {
      render(
        <Index
          books={[]}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      const submitButton = screen.getByRole('button', { name: /Upload Book/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Responsive Grid', () => {
    it('applies grid classes for responsive layout', () => {
      const { container } = render(
        <Index
          books={mockBooks}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('gap-4', 'md:grid-cols-2', 'lg:grid-cols-3')
    })
  })

  describe('Multiple Books', () => {
    it('renders all books in the list', () => {
      render(
        <Index
          books={mockBooks}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByText('Family History')).toBeInTheDocument()
      expect(screen.getByText('history-book.pdf')).toBeInTheDocument()
    })

    it('renders correct number of book cards', () => {
      const { container } = render(
        <Index
          books={mockBooks}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      const cards = container.querySelectorAll('.bg-white.rounded-lg.shadow')
      // -1 because upload form also has these classes
      expect(cards.length).toBeGreaterThanOrEqual(mockBooks.length)
    })
  })
})
