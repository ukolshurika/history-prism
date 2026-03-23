import { render, screen, fireEvent } from '@testing-library/react'
import Show from '../Show'

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => <a href={href} className={className}>{children}</a>,
  useForm: () => ({
    data: {},
    setData: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    processing: false,
    errors: {},
    reset: jest.fn(),
  }),
  usePage: () => ({ props: { yandex_maps_api_key: 'test-key' } }),
  router: { delete: jest.fn(), get: jest.fn(), post: jest.fn() },
}))

jest.mock('../../Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

// Access the mocked router after the mock is set up
const { router: mockRouter } = jest.requireMock('@inertiajs/react')

describe('Events Show', () => {
  const mockCurrentUser = { id: 1, email: 'viewer@example.com' }

  const mockEvent = {
    id: 5,
    title: 'Battle of Thermopylae',
    category: 'military',
    description: 'A famous battle in 480 BC.',
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-01-03T00:00:00Z',
    created_at: '2024-03-01T12:00:00Z',
    creator: { email: 'creator@example.com' },
  }

  const defaultProps = {
    event: mockEvent,
    can_edit: false,
    can_delete: false,
    current_user: mockCurrentUser,
    flash: {},
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Ensure router.delete is always a fresh mock for each test
  })

  it('renders event.title as heading', () => {
    render(<Show {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'Battle of Thermopylae' })).toBeInTheDocument()
  })

  it('renders event.category badge', () => {
    render(<Show {...defaultProps} />)
    expect(screen.getByText('military')).toBeInTheDocument()
  })

  it('shows "Back to Events" link to /events', () => {
    render(<Show {...defaultProps} />)
    const backLink = screen.getByText(/Back to Events/i).closest('a')
    expect(backLink).toHaveAttribute('href', '/events')
  })

  it('shows Description field label', () => {
    render(<Show {...defaultProps} />)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('shows Start Date field label', () => {
    render(<Show {...defaultProps} />)
    expect(screen.getByText('Start Date')).toBeInTheDocument()
  })

  it('shows End Date field label', () => {
    render(<Show {...defaultProps} />)
    expect(screen.getByText('End Date')).toBeInTheDocument()
  })

  it('shows Created By field label', () => {
    render(<Show {...defaultProps} />)
    expect(screen.getByText('Created By')).toBeInTheDocument()
  })

  it('shows creator email value', () => {
    render(<Show {...defaultProps} />)
    expect(screen.getByText('creator@example.com')).toBeInTheDocument()
  })

  it('shows Edit link when can_edit is true', () => {
    render(<Show {...defaultProps} can_edit={true} />)
    const editLink = screen.getByText('Edit').closest('a')
    expect(editLink).toHaveAttribute('href', `/events/${mockEvent.id}/edit`)
  })

  it('does not show Edit link when can_edit is false', () => {
    render(<Show {...defaultProps} can_edit={false} />)
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  it('shows Delete button when can_delete is true', () => {
    render(<Show {...defaultProps} can_delete={true} />)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('does not show Delete button when can_delete is false', () => {
    render(<Show {...defaultProps} can_delete={false} />)
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('calls confirm() then router.delete on confirm', () => {
    global.confirm = jest.fn(() => true)
    render(<Show {...defaultProps} can_delete={true} />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this event?')
    expect(mockRouter.delete).toHaveBeenCalledWith(`/events/${mockEvent.id}`)
  })

  it('does NOT call router.delete if confirm is cancelled', () => {
    global.confirm = jest.fn(() => false)
    render(<Show {...defaultProps} can_delete={true} />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(global.confirm).toHaveBeenCalled()
    expect(mockRouter.delete).not.toHaveBeenCalled()
  })
})
