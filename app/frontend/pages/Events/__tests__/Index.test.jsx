import { render, screen } from '@testing-library/react'
import Index from '../Index'

const mockPost = jest.fn()
const mockPut = jest.fn()
const mockDelete = jest.fn()
const mockGet = jest.fn()

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => <a href={href} className={className}>{children}</a>,
  useForm: () => ({
    data: {},
    setData: jest.fn(),
    post: mockPost,
    put: mockPut,
    processing: false,
    errors: {},
    reset: jest.fn(),
  }),
  usePage: () => ({ props: { yandex_maps_api_key: 'test-key' } }),
  router: { delete: mockDelete, get: mockGet, post: mockPost },
}))

jest.mock('../../Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

describe('Events Index', () => {
  const mockCurrentUser = { id: 1, email: 'test@example.com' }

  const mockEvents = [
    {
      id: 1,
      title: 'Battle of Hastings',
      category: 'military',
      start_date_display: '1066-10-14',
      location: { place: 'Hastings, England' },
      source_name: 'History Book',
      page_number: null,
      source_attachment_url: null,
    },
    {
      id: 2,
      title: 'Signing of Magna Carta',
      category: 'political',
      start_date_display: '1215-06-15',
      location: { place: 'Runnymede' },
      source_name: null,
      page_number: 42,
      source_attachment_url: '/books/1/attachment',
    },
  ]

  const defaultProps = {
    events: [],
    current_user: null,
    flash: {},
    pagination: { total_pages: 1, total_count: 0, current_page: 1 },
    filters: {},
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "Events" heading', () => {
    render(<Index {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'Events' })).toBeInTheDocument()
  })

  it('shows "+ New Event" link to /events/new when current_user is present', () => {
    render(<Index {...defaultProps} current_user={mockCurrentUser} />)
    const link = screen.getByText('+ New Event').closest('a')
    expect(link).toHaveAttribute('href', '/events/new')
  })

  it('does not show "+ New Event" link when no current_user', () => {
    render(<Index {...defaultProps} current_user={null} />)
    expect(screen.queryByText('+ New Event')).not.toBeInTheDocument()
  })

  it('shows "No events found." when events is empty', () => {
    render(<Index {...defaultProps} events={[]} />)
    expect(screen.getByText('No events found.')).toBeInTheDocument()
  })

  it('renders event titles as links when events are present', () => {
    render(<Index {...defaultProps} events={mockEvents} />)
    const link1 = screen.getByText('Battle of Hastings').closest('a')
    expect(link1).toHaveAttribute('href', '/events/1')
    const link2 = screen.getByText('Signing of Magna Carta').closest('a')
    expect(link2).toHaveAttribute('href', '/events/2')
  })

  it('renders category badges', () => {
    render(<Index {...defaultProps} events={mockEvents} />)
    expect(screen.getByText('military')).toBeInTheDocument()
    expect(screen.getByText('political')).toBeInTheDocument()
  })

  it('renders search input with placeholder "Search events..."', () => {
    render(<Index {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search events...')).toBeInTheDocument()
  })

  it('renders Search button', () => {
    render(<Index {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  })

  it('shows Clear button when filters.q is set', () => {
    render(<Index {...defaultProps} filters={{ q: 'battle' }} />)
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
  })

  it('does not show Clear button when filters.q is not set', () => {
    render(<Index {...defaultProps} filters={{}} />)
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()
  })

  it('shows "Filtered by source:" badge when filters.source_type is set', () => {
    render(<Index {...defaultProps} events={[]} filters={{ source_type: 'Book', source_id: 3 }} />)
    expect(screen.getByText(/Filtered by source:/i)).toBeInTheDocument()
  })

  it('does not show "Filtered by source:" when no source_type filter', () => {
    render(<Index {...defaultProps} filters={{}} />)
    expect(screen.queryByText(/Filtered by source:/i)).not.toBeInTheDocument()
  })

  it('renders Start Date column header (sortable)', () => {
    render(<Index {...defaultProps} events={mockEvents} />)
    expect(screen.getByText(/Start Date/i)).toBeInTheDocument()
  })

  it('renders Place column header (sortable)', () => {
    render(<Index {...defaultProps} events={mockEvents} />)
    expect(screen.getByText(/Place/i)).toBeInTheDocument()
  })

  it('shows pagination controls when pagination.total_pages > 1', () => {
    render(
      <Index
        {...defaultProps}
        events={mockEvents}
        pagination={{ total_pages: 3, total_count: 30, current_page: 1 }}
      />
    )
    // Prev and next buttons rendered as « and »
    expect(screen.getByText('«')).toBeInTheDocument()
    expect(screen.getByText('»')).toBeInTheDocument()
  })

  it('does not show pagination controls when total_pages is 1', () => {
    render(
      <Index
        {...defaultProps}
        events={mockEvents}
        pagination={{ total_pages: 1, total_count: 2, current_page: 1 }}
      />
    )
    expect(screen.queryByText('«')).not.toBeInTheDocument()
  })
})
