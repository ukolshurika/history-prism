import { render, screen, fireEvent } from '@testing-library/react'
import Index from '../Index'

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => <a href={href} className={className}>{children}</a>,
  useForm: jest.fn(() => ({
    data: {},
    setData: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    processing: false,
    errors: {},
  })),
  router: {
    delete: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
  },
}))

// Mock Layout
jest.mock('../../Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

// Helper to access the mocked router
const getRouter = () => require('@inertiajs/react').router

describe('Timelines Index', () => {
  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  }

  const mockTimelines = [
    {
      id: 1,
      title: 'Family Timeline',
      person_id: 1,
      person_name: 'John Doe',
      start_at: '1900-01-01',
      end_at: '1950-12-31',
      visible: true,
    },
    {
      id: 2,
      title: 'History Timeline',
      person_id: 2,
      person_name: 'Jane Smith',
      start_at: '1920-01-01',
      end_at: '1970-12-31',
      visible: false,
    },
  ]

  beforeEach(() => {
    const router = getRouter()
    router.delete.mockClear()
    router.put.mockClear()
    router.post.mockClear()
  })

  it('renders "Timelines" heading', () => {
    render(
      <Index
        timelines={[]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getByText('Timelines')).toBeInTheDocument()
  })

  it('shows "Create Timeline" link when current_user is present', () => {
    render(
      <Index
        timelines={[]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const createLink = screen.getByText('Create Timeline').closest('a')
    expect(createLink).toBeInTheDocument()
    expect(createLink).toHaveAttribute('href', '/timelines/new')
  })

  it('does not show "Create Timeline" link when no current_user', () => {
    render(
      <Index
        timelines={[]}
        current_user={null}
        flash={{}}
      />
    )

    expect(screen.queryByText('Create Timeline')).not.toBeInTheDocument()
  })

  it('shows "No timelines created yet." when timelines is empty', () => {
    render(
      <Index
        timelines={[]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getByText('No timelines created yet.')).toBeInTheDocument()
  })

  it('renders timeline title for each timeline when timelines are present', () => {
    render(
      <Index
        timelines={mockTimelines}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getByText('Family Timeline')).toBeInTheDocument()
    expect(screen.getByText('History Timeline')).toBeInTheDocument()
  })

  it('shows person_name for each timeline', () => {
    render(
      <Index
        timelines={mockTimelines}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getByText(/John Doe/)).toBeInTheDocument()
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument()
  })

  it('shows "Public" badge when timeline.visible is true', () => {
    render(
      <Index
        timelines={mockTimelines}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getByText('Public')).toBeInTheDocument()
  })

  it('does not show "Public" badge when timeline.visible is false', () => {
    render(
      <Index
        timelines={[mockTimelines[1]]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.queryByText('Public')).not.toBeInTheDocument()
  })

  it('shows View link to /timelines/:id', () => {
    render(
      <Index
        timelines={[mockTimelines[0]]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const viewLink = screen.getByText('View').closest('a')
    expect(viewLink).toHaveAttribute('href', '/timelines/1')
  })

  it('shows Edit link to /timelines/:id/edit', () => {
    render(
      <Index
        timelines={[mockTimelines[0]]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const editLink = screen.getByText('Edit').closest('a')
    expect(editLink).toHaveAttribute('href', '/timelines/1/edit')
  })

  it('shows Delete button for each timeline', () => {
    render(
      <Index
        timelines={mockTimelines}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const deleteButtons = screen.getAllByText('Delete')
    expect(deleteButtons).toHaveLength(2)
  })

  it('calls confirm() then router.delete when Delete is clicked and confirmed', () => {
    global.confirm = jest.fn(() => true)
    const router = getRouter()

    render(
      <Index
        timelines={[mockTimelines[0]]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this timeline?')
    expect(router.delete).toHaveBeenCalledWith('/timelines/1', expect.any(Object))
  })

  it('does NOT call router.delete if confirm is cancelled', () => {
    global.confirm = jest.fn(() => false)
    const router = getRouter()

    render(
      <Index
        timelines={[mockTimelines[0]]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    expect(global.confirm).toHaveBeenCalled()
    expect(router.delete).not.toHaveBeenCalled()
  })

  it('shows "Deleting..." on Delete button while in deleting state', () => {
    global.confirm = jest.fn(() => true)
    const router = getRouter()

    // Override router.delete to not call onFinish, simulating an in-progress delete
    router.delete.mockImplementation((url, options) => {
      // Don't call onFinish so the deleting state persists
    })

    render(
      <Index
        timelines={[mockTimelines[0]]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    expect(screen.getByText('Deleting...')).toBeInTheDocument()
  })
})
