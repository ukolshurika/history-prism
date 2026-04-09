import { render, screen, fireEvent } from '@testing-library/react'
import { router } from '@inertiajs/react'
import Show from '../Show'

jest.mock('@inertiajs/react', () => ({
  ...jest.requireActual('@inertiajs/react'),
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className, ...props }) => <a href={href} className={className} {...props}>{children}</a>,
  router: {
    delete: jest.fn(),
  },
}))

jest.mock('../../Layout', () => function Layout({ children }) {
  return <div data-testid="layout">{children}</div>
})

describe('Books Show', () => {
  const mockBook = {
    id: 1,
    name: 'Family History',
    location: 'New York Library',
    attachment_name: 'family.pdf',
    attachment_url: '/rails/active_storage/blobs/xyz/family.pdf',
    created_at: '2024-01-15T10:00:00Z',
    events_count: 5,
  }

  const mockCurrentUser = { id: 1, email: 'test@example.com' }

  beforeEach(() => {
    jest.clearAllMocks()
    global.confirm = jest.fn(() => true)
  })

  it('renders book title and metadata', () => {
    render(<Show book={mockBook} can_edit current_user={mockCurrentUser} can_delete flash={{}} />)

    expect(screen.getByText('Family History')).toBeInTheDocument()
    expect(screen.getByText('New York Library')).toBeInTheDocument()
    expect(screen.getByText('family.pdf')).toBeInTheDocument()
  })

  it('renders back link to books index', () => {
    render(<Show book={mockBook} can_edit current_user={mockCurrentUser} can_delete flash={{}} />)

    const backLink = screen.getByText('← Back to Books').closest('a')
    expect(backLink).toHaveAttribute('href', '/books')
  })

  it('renders download and edit actions', () => {
    render(<Show book={mockBook} can_edit current_user={mockCurrentUser} can_delete flash={{}} />)

    expect(screen.getByText('Download PDF').closest('a')).toHaveAttribute('href', mockBook.attachment_url)
    expect(screen.getByText('Edit Book').closest('a')).toHaveAttribute('href', '/books/1/edit')
  })

  it('deletes the book when confirmed', () => {
    render(<Show book={mockBook} can_edit current_user={mockCurrentUser} can_delete flash={{}} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete Book' }))

    expect(router.delete).toHaveBeenCalledWith('/books/1')
  })
})
