import { render, screen, fireEvent } from '@testing-library/react'
import Form from '../../../app/frontend/pages/Events/Form'

const mockPost = jest.fn()
const mockPut = jest.fn()
const mockSetData = jest.fn()

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>,
  useForm: jest.fn(),
  usePage: () => ({ props: { yandex_maps_api_key: 'test-key' } }),
}))

jest.mock('../../../app/frontend/pages/Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

jest.mock('../../../app/frontend/components/YandexMapPicker', () => {
  return function YandexMapPicker({ onChange, disabled, address }) {
    return (
      <div data-testid="yandex-map-picker">
        <button
          type="button"
          data-testid="map-pick"
          onClick={() => onChange(55.75, 37.62, 'Москва, Россия')}
          disabled={disabled}
        >
          Pick location
        </button>
        {address && <span data-testid="map-address">{address}</span>}
      </div>
    )
  }
})

const CATEGORIES = ['person', 'world', 'country', 'local']
const CURRENT_USER = { id: 1, email: 'user@example.com' }

function makeDateAttributes(overrides = {}) {
  return {
    original_text: '',
    date_type: 'exact',
    year: '',
    month: '',
    day: '',
    calendar_type: 'gregorian',
    ...overrides,
  }
}

function makeFormData(overrides = {}) {
  return {
    event: {
      title: '',
      description: '',
      category: 'person',
      person_ids: [],
      start_date_attributes: makeDateAttributes(),
      end_date_attributes: makeDateAttributes(),
      location_attributes: { id: null, place: '', latitude: null, longitude: null },
      ...overrides,
    },
  }
}

function setupUseForm(dataOverrides = {}, processing = false) {
  const { useForm } = require('@inertiajs/react')
  useForm.mockReturnValue({
    data: makeFormData(dataOverrides),
    setData: mockSetData,
    post: mockPost,
    put: mockPut,
    processing,
  })
}

function renderForm(props = {}) {
  return render(
    <Form
      event={{}}
      categories={CATEGORIES}
      isEdit={false}
      current_user={CURRENT_USER}
      flash={{}}
      errors={[]}
      {...props}
    />
  )
}

afterEach(() => jest.clearAllMocks())

describe('Events Form — new event', () => {
  beforeEach(() => setupUseForm())

  it('renders "Create New Event" heading', () => {
    renderForm()
    expect(screen.getByText('Create New Event')).toBeInTheDocument()
  })

  it('renders Create Event submit button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: 'Create Event' })).toBeInTheDocument()
  })

  it('renders all basic fields', () => {
    renderForm()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Date Entry')).toBeInTheDocument()
    expect(screen.getByLabelText('Date Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Year')).toBeInTheDocument()
  })

  it('renders all category options', () => {
    renderForm()
    CATEGORIES.forEach(cat => {
      expect(screen.getByText(cat.charAt(0).toUpperCase() + cat.slice(1))).toBeInTheDocument()
    })
  })

  it('description is a textarea', () => {
    renderForm()
    expect(screen.getByLabelText('Description').tagName).toBe('TEXTAREA')
  })

  it('shows single-date mode by default', () => {
    renderForm()
    expect(screen.getByLabelText('Date Entry')).toHaveValue('single')
    expect(screen.queryByText('End Date')).not.toBeInTheDocument()
  })

  it('has Cancel link pointing to /events', () => {
    renderForm()
    expect(screen.getByText('Cancel').closest('a')).toHaveAttribute('href', '/events')
  })

  it('has Back to Events link', () => {
    renderForm()
    const backLink = screen.getByText(/Back to Events/)
    expect(backLink.closest('a')).toHaveAttribute('href', '/events')
  })

  it('renders inside Layout', () => {
    renderForm()
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('calls post on submit', () => {
    setupUseForm({ start_date_attributes: makeDateAttributes({ year: '1945', month: '05', day: '08' }) })
    renderForm()
    const form = screen.getByRole('button', { name: 'Create Event' }).closest('form')
    fireEvent.submit(form)
    expect(mockPost).toHaveBeenCalledWith('/events')
  })

  it('calls setData on title change', () => {
    renderForm()
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Новое событие' } })
    expect(mockSetData).toHaveBeenCalledWith('event.title', 'Новое событие')
  })

  it('calls setData on description change', () => {
    renderForm()
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Описание' } })
    expect(mockSetData).toHaveBeenCalledWith('event.description', 'Описание')
  })

  it('calls setData on category change', () => {
    renderForm()
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'world' } })
    expect(mockSetData).toHaveBeenCalledWith('event.category', 'world')
  })

  it('shows end date fields when switching to range mode', () => {
    renderForm()

    fireEvent.change(screen.getByLabelText('Date Entry'), { target: { value: 'range' } })

    expect(screen.getByText('End Date')).toBeInTheDocument()
    expect(mockSetData).toHaveBeenCalledWith('event.start_date_attributes.date_type', 'exact')
    expect(mockSetData).toHaveBeenCalledWith('event.end_date_attributes', expect.objectContaining({
      date_type: 'exact',
    }))
  })

  it('clears hidden end date attributes when switching back to single mode', () => {
    renderForm()

    fireEvent.change(screen.getByLabelText('Date Entry'), { target: { value: 'range' } })
    fireEvent.change(screen.getByLabelText('Date Entry'), { target: { value: 'single' } })

    expect(mockSetData).toHaveBeenCalledWith('event.end_date_attributes', expect.objectContaining({
      date_type: 'exact',
      year: '',
    }))
  })

  it('changes start date type and clears incompatible parts for year-only dates', () => {
    setupUseForm({
      start_date_attributes: makeDateAttributes({ year: '1900', month: '04', day: '11' }),
    })

    renderForm()
    fireEvent.change(screen.getByLabelText('Date Type'), { target: { value: 'year' } })

    expect(mockSetData).toHaveBeenCalledWith('event.start_date_attributes.date_type', 'year')
    expect(mockSetData).toHaveBeenCalledWith('event.start_date_attributes.month', '')
    expect(mockSetData).toHaveBeenCalledWith('event.start_date_attributes.day', '')
  })

  it('switches to approximate mode and updates the start date type', () => {
    renderForm()

    fireEvent.change(screen.getByLabelText('Date Entry'), { target: { value: 'about' } })

    expect(mockSetData).toHaveBeenCalledWith('event.end_date_attributes', expect.objectContaining({
      date_type: 'exact',
      year: '',
    }))
    expect(mockSetData).toHaveBeenCalledWith('event.start_date_attributes.date_type', 'about')
  })

  it('switches to year-only mode and clears month/day from the start date', () => {
    setupUseForm({
      start_date_attributes: makeDateAttributes({ year: '1900', month: '04', day: '11' }),
    })

    renderForm()
    fireEvent.change(screen.getByLabelText('Date Entry'), { target: { value: 'year' } })

    expect(mockSetData).toHaveBeenCalledWith('event.start_date_attributes.date_type', 'year')
    expect(mockSetData).toHaveBeenCalledWith('event.start_date_attributes.month', '')
    expect(mockSetData).toHaveBeenCalledWith('event.start_date_attributes.day', '')
  })

  it('shows client validation errors and blocks submit when start year is missing', () => {
    renderForm()

    fireEvent.submit(screen.getByRole('button', { name: 'Create Event' }).closest('form'))

    expect(screen.getByText('Start Date: year is required.')).toBeInTheDocument()
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('shows exact-date validation errors and blocks submit when month/day are missing', () => {
    setupUseForm({
      start_date_attributes: makeDateAttributes({ year: '1945', month: '', day: '', date_type: 'exact' }),
    })

    renderForm()
    fireEvent.submit(screen.getByRole('button', { name: 'Create Event' }).closest('form'))

    expect(screen.getByText('Start Date: month is required for this date type.')).toBeInTheDocument()
    expect(screen.getByText('Start Date: day is required for an exact date.')).toBeInTheDocument()
    expect(mockPost).not.toHaveBeenCalled()
  })
})

describe('Events Form — edit event', () => {
  const EXISTING_EVENT = {
    id: 42,
    title: 'Battle of Waterloo',
    description: 'A major battle',
    start_date_attributes: {
      original_text: '1815-06-18',
      date_type: 'exact',
      year: 1815,
      month: 6,
      day: 18,
      calendar_type: 'gregorian',
    },
    end_date_attributes: {
      original_text: '1815-06-18',
      date_type: 'exact',
      year: 1815,
      month: 6,
      day: 18,
      calendar_type: 'gregorian',
    },
    category: 'world',
    person_ids: [],
    location: { id: 7, place: 'Waterloo', latitude: 50.68, longitude: 4.41 },
  }

  beforeEach(() => {
    setupUseForm({
      title: EXISTING_EVENT.title,
      description: EXISTING_EVENT.description,
      start_date_attributes: makeDateAttributes({ year: '1815', month: '06', day: '18' }),
      category: EXISTING_EVENT.category,
      location_attributes: EXISTING_EVENT.location,
    })
  })

  it('renders "Edit Event" heading', () => {
    renderForm({ event: EXISTING_EVENT, isEdit: true })
    expect(screen.getByText('Edit Event')).toBeInTheDocument()
  })

  it('renders Update Event button', () => {
    renderForm({ event: EXISTING_EVENT, isEdit: true })
    expect(screen.getByRole('button', { name: 'Update Event' })).toBeInTheDocument()
  })

  it('calls put on submit', () => {
    renderForm({ event: EXISTING_EVENT, isEdit: true })
    fireEvent.submit(screen.getByRole('button', { name: 'Update Event' }).closest('form'))
    expect(mockPut).toHaveBeenCalledWith('/events/42')
  })

  it('initializes useForm with serialized fuzzy date attributes', () => {
    renderForm({ event: EXISTING_EVENT, isEdit: true })

    const { useForm } = require('@inertiajs/react')
    expect(useForm).toHaveBeenCalledWith(expect.objectContaining({
      event: expect.objectContaining({
        start_date_attributes: expect.objectContaining({
          date_type: 'exact',
          year: '1815',
          month: '06',
          day: '18',
        }),
        end_date_attributes: expect.objectContaining({
          year: '',
        }),
      }),
    }))
  })
})

describe('Events Form — loading state', () => {
  it('shows Creating... and disables button when processing', () => {
    setupUseForm({}, true)
    renderForm()
    const btn = screen.getByRole('button', { name: 'Creating...' })
    expect(btn).toBeDisabled()
  })

  it('shows Updating... when processing in edit mode', () => {
    setupUseForm({}, true)
    renderForm({ event: { id: 1 }, isEdit: true })
    expect(screen.getByText('Updating...')).toBeInTheDocument()
  })
})

describe('Events Form — error display', () => {
  it('renders error messages', () => {
    setupUseForm()
    renderForm({ errors: ["Title can't be blank", 'Category is invalid'] })
    expect(screen.getByText("Title can't be blank")).toBeInTheDocument()
    expect(screen.getByText('Category is invalid')).toBeInTheDocument()
  })

  it('does not render error block when no errors', () => {
    setupUseForm()
    renderForm({ errors: [] })
    expect(screen.queryByText(/can't be blank/)).not.toBeInTheDocument()
  })
})

describe('Events Form — Associated People', () => {
  const PEOPLE = [
    { id: 1, full_name: 'Иван Иванов' },
    { id: 2, full_name: 'Мария Петрова' },
  ]

  it('shows Associated People when category is person', () => {
    setupUseForm({ category: 'person' })
    renderForm({ people: PEOPLE })
    expect(screen.getByLabelText('Associated People')).toBeInTheDocument()
    expect(screen.getByText('Иван Иванов')).toBeInTheDocument()
  })

  it('hides Associated People for non-person categories', () => {
    setupUseForm({ category: 'world' })
    renderForm({ people: PEOPLE })
    expect(screen.queryByLabelText('Associated People')).not.toBeInTheDocument()
  })

  it('clears person_ids when switching away from person', () => {
    setupUseForm({ category: 'person', person_ids: [1] })
    renderForm({ people: PEOPLE })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'world' } })
    expect(mockSetData).toHaveBeenCalledWith('event.category', 'world')
    expect(mockSetData).toHaveBeenCalledWith('event.person_ids', [])
  })

  it('does not clear person_ids when switching to person', () => {
    setupUseForm({ category: 'world' })
    renderForm({ people: PEOPLE })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'person' } })
    expect(mockSetData).toHaveBeenCalledWith('event.category', 'person')
    expect(mockSetData).not.toHaveBeenCalledWith('event.person_ids', [])
  })
})

describe('Events Form — YandexMapPicker', () => {
  it('renders map picker section with label', () => {
    setupUseForm()
    renderForm()
    expect(screen.getByTestId('yandex-map-picker')).toBeInTheDocument()
    expect(screen.getByText('Event Location')).toBeInTheDocument()
  })

  it('calls setData with location_attributes on map pick', () => {
    setupUseForm()
    renderForm()
    fireEvent.click(screen.getByTestId('map-pick'))
    expect(mockSetData).toHaveBeenCalledWith(
      'event.location_attributes',
      expect.objectContaining({
        latitude: 55.75,
        longitude: 37.62,
        place: 'Москва, Россия',
      })
    )
  })

  it('passes existing address to map picker', () => {
    setupUseForm({
      location_attributes: { id: 5, place: 'Санкт-Петербург', latitude: 59.93, longitude: 30.33 },
    })
    renderForm()
    expect(screen.getByTestId('map-address')).toHaveTextContent('Санкт-Петербург')
  })

  it('map picker button is disabled when processing', () => {
    setupUseForm({}, true)
    renderForm()
    expect(screen.getByTestId('map-pick')).toBeDisabled()
  })
})
