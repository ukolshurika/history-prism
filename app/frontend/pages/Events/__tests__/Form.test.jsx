import { render, screen, fireEvent } from '@testing-library/react'
import Form from '../Form'

// Store for tracking calls - defined before mocks
const mockCalls = {
  post: [],
  put: [],
}

jest.mock('@inertiajs/react', () => {
  const postFn = (...args) => mockCalls.post.push(args)
  const putFn = (...args) => mockCalls.put.push(args)
  return {
    Head: ({ title }) => <title>{title}</title>,
    Link: ({ href, children, className }) => <a href={href} className={className}>{children}</a>,
    useForm: (initialData) => ({
      data: initialData,
      setData: jest.fn(),
      post: postFn,
      put: putFn,
      processing: false,
      errors: {},
      reset: jest.fn(),
    }),
    usePage: () => ({ props: { yandex_maps_api_key: 'test-key' } }),
    router: { delete: jest.fn(), get: jest.fn(), post: jest.fn() },
  }
})

jest.mock('../../../components/YandexMapPicker', () => {
  return function YandexMapPicker() {
    return <div data-testid="yandex-map-picker" />
  }
})

jest.mock('../../Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

describe('Events Form', () => {
  const mockCurrentUser = { id: 1, email: 'test@example.com' }

  const mockCategories = ['person', 'military', 'political']

  const mockPeople = [
    { id: 1, full_name: 'John Doe' },
    { id: 2, full_name: 'Jane Smith' },
  ]

  const newEvent = {
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    category: 'person',
    person_ids: [],
    location: null,
  }

  const existingEvent = {
    id: 7,
    title: 'Great Fire of London',
    description: 'A major fire in 1666.',
    start_date: '1666-09-02T00:00:00Z',
    end_date: '1666-09-06T00:00:00Z',
    category: 'military',
    person_ids: [],
    location: { id: 1, place: 'London', latitude: 51.5, longitude: -0.12 },
  }

  const defaultProps = {
    event: newEvent,
    categories: mockCategories,
    people: mockPeople,
    isEdit: false,
    current_user: mockCurrentUser,
    flash: {},
    errors: [],
  }

  beforeEach(() => {
    mockCalls.post = []
    mockCalls.put = []
    jest.clearAllMocks()
  })

  it('renders "Create New Event" heading in create mode', () => {
    render(<Form {...defaultProps} isEdit={false} />)
    expect(screen.getByRole('heading', { name: 'Create New Event' })).toBeInTheDocument()
  })

  it('renders "Edit Event" heading in edit mode', () => {
    render(<Form {...defaultProps} event={existingEvent} isEdit={true} />)
    expect(screen.getByRole('heading', { name: 'Edit Event' })).toBeInTheDocument()
  })

  it('renders Title field', () => {
    render(<Form {...defaultProps} />)
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument()
  })

  it('renders Description field', () => {
    render(<Form {...defaultProps} />)
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
  })

  it('renders Category select with options from categories prop', () => {
    render(<Form {...defaultProps} />)
    const select = screen.getByLabelText(/Category/i)
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Person' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Military' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Political' })).toBeInTheDocument()
  })

  it('renders Start Date input', () => {
    render(<Form {...defaultProps} />)
    expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument()
  })

  it('renders End Date input', () => {
    render(<Form {...defaultProps} />)
    expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument()
  })

  it('shows "Associated People" select when category is "person"', () => {
    // newEvent.category is 'person', so the people select appears by default
    render(<Form {...defaultProps} event={{ ...newEvent, category: 'person' }} />)
    expect(screen.getByLabelText(/Associated People/i)).toBeInTheDocument()
  })

  it('does not show "Associated People" select when category is not "person"', () => {
    render(<Form {...defaultProps} event={{ ...newEvent, category: 'military' }} />)
    expect(screen.queryByLabelText(/Associated People/i)).not.toBeInTheDocument()
  })

  it('shows errors when errors array is not empty', () => {
    const errors = ['Title is required', 'Start date is invalid']
    render(<Form {...defaultProps} errors={errors} />)
    expect(screen.getByText('Title is required')).toBeInTheDocument()
    expect(screen.getByText('Start date is invalid')).toBeInTheDocument()
  })

  it('does not show error section when errors is empty', () => {
    render(<Form {...defaultProps} errors={[]} />)
    expect(screen.queryByText(/Title is required/i)).not.toBeInTheDocument()
  })

  it('calls post("/events") on submit in create mode', () => {
    render(<Form {...defaultProps} isEdit={false} />)
    fireEvent.submit(screen.getByRole('button', { name: /Create Event/i }).closest('form'))
    expect(mockCalls.post).toEqual([['/events']])
  })

  it('calls put("/events/:id") on submit in edit mode', () => {
    render(<Form {...defaultProps} event={existingEvent} isEdit={true} />)
    fireEvent.submit(screen.getByRole('button', { name: /Update Event/i }).closest('form'))
    expect(mockCalls.put).toEqual([[`/events/${existingEvent.id}`]])
  })

  it('Cancel link goes to /events', () => {
    render(<Form {...defaultProps} />)
    const cancelLink = screen.getByText('Cancel').closest('a')
    expect(cancelLink).toHaveAttribute('href', '/events')
  })

  it('renders YandexMapPicker', () => {
    render(<Form {...defaultProps} />)
    expect(screen.getByTestId('yandex-map-picker')).toBeInTheDocument()
  })
})
