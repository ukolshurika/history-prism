import { render, screen, fireEvent } from '@testing-library/react'
import Index from '../../../app/frontend/pages/Events/Index'

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>,
  router: { get: jest.fn() },
}))

jest.mock('../../../app/frontend/pages/Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

const { router } = require('@inertiajs/react')

const EVENTS = [
  {
    id: 1,
    title: 'Рождение Ивана',
    category: 'person',
    start_date_display: '1850',
    location: { place: 'Москва' },
    source_name: 'Метрическая книга',
    page_number: 12,
  },
  {
    id: 2,
    title: 'Battle of Waterloo',
    category: 'world',
    start_date_display: '1815-06-18',
    location: null,
    source_name: null,
    page_number: null,
  },
]

const PAGINATION = {
  page: 1,
  total_pages: 3,
  total: 62,
  per_page: 25,
}

const CURRENT_USER = { id: 1, email: 'test@example.com' }

function renderIndex(props = {}) {
  return render(
    <Index
      events={EVENTS}
      current_user={CURRENT_USER}
      flash={{}}
      meta={PAGINATION}
      filters={{}}
      {...props}
    />
  )
}

afterEach(() => jest.clearAllMocks())

describe('Events Index — table', () => {
  it('renders page title', () => {
    renderIndex()
    expect(screen.getByText('Events')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    renderIndex()
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText(/Category/i)).toBeInTheDocument()
    expect(screen.getByText(/Source/i)).toBeInTheDocument()
    expect(screen.getByText(/Page/i)).toBeInTheDocument()
  })

  it('renders event titles as links', () => {
    renderIndex()
    expect(screen.getByText('Рождение Ивана').closest('a')).toHaveAttribute('href', '/events/1')
    expect(screen.getByText('Battle of Waterloo').closest('a')).toHaveAttribute('href', '/events/2')
  })

  it('renders category badges', () => {
    renderIndex()
    expect(screen.getByText('person')).toBeInTheDocument()
    expect(screen.getByText('world')).toBeInTheDocument()
  })

  it('renders start_date_display', () => {
    renderIndex()
    expect(screen.getByText('1850')).toBeInTheDocument()
    expect(screen.getByText('1815-06-18')).toBeInTheDocument()
  })

  it('renders location place', () => {
    renderIndex()
    expect(screen.getByText('Москва')).toBeInTheDocument()
  })

  it('renders em-dash for missing fields', () => {
    renderIndex()
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('renders source_name', () => {
    renderIndex()
    expect(screen.getByText('Метрическая книга')).toBeInTheDocument()
  })

  it('renders page_number', () => {
    renderIndex()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('renders inside Layout', () => {
    renderIndex()
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })
})

describe('Events Index — empty state', () => {
  it('shows empty state message', () => {
    renderIndex({ events: [] })
    expect(screen.getByText('No events found.')).toBeInTheDocument()
  })

  it('shows create link for logged-in user', () => {
    renderIndex({ events: [] })
    expect(screen.getByText('Create the first event')).toBeInTheDocument()
  })

  it('hides create link for guests', () => {
    renderIndex({ events: [], current_user: null })
    expect(screen.queryByText('Create the first event')).not.toBeInTheDocument()
  })
})

describe('Events Index — new event button', () => {
  it('shows button for logged-in user', () => {
    renderIndex()
    expect(screen.getByText('+ New Event')).toBeInTheDocument()
  })

  it('hides button for guests', () => {
    renderIndex({ current_user: null })
    expect(screen.queryByText('+ New Event')).not.toBeInTheDocument()
  })
})

describe('Events Index — source filter badge', () => {
  it('shows filter info when source filters are active', () => {
    renderIndex({ filters: { source_type: 'Book', source_id: '5' } })
    expect(screen.getByText(/Filtered by source/)).toBeInTheDocument()
  })

  it('does not show filter badge without filters', () => {
    renderIndex({ filters: {} })
    expect(screen.queryByText(/Filtered by source/)).not.toBeInTheDocument()
  })
})

describe('Events Index — search', () => {
  it('renders search input and button', () => {
    renderIndex()
    expect(screen.getByPlaceholderText('Search events...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  })

  it('initialises input from filters.q', () => {
    renderIndex({ filters: { q: 'Иван' } })
    expect(screen.getByPlaceholderText('Search events...')).toHaveValue('Иван')
  })

  it('shows Clear button only when filters.q is set', () => {
    renderIndex({ filters: { q: 'Иван' } })
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
  })

  it('hides Clear button when no query', () => {
    renderIndex({ filters: {} })
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()
  })

  it('calls router.get with q on submit, preserving source filters', () => {
    renderIndex({ filters: { source_type: 'Book', source_id: '5' } })
    const input = screen.getByPlaceholderText('Search events...')
    fireEvent.change(input, { target: { value: 'революция' } })
    fireEvent.submit(input.closest('form'))
    expect(router.get).toHaveBeenCalledWith(
      '/events',
      expect.objectContaining({ q: 'революция', source_type: 'Book', source_id: '5' }),
      expect.any(Object)
    )
  })

  it('preserves source filters on clear', () => {
    renderIndex({ filters: { q: 'test', source_type: 'Book', source_id: '5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(router.get).toHaveBeenCalledWith(
      '/events',
      expect.objectContaining({ source_type: 'Book', source_id: '5' }),
      expect.any(Object)
    )
  })
})

describe('Events Index — sortable headers', () => {
  it('clicking Start Date calls router.get with sort=date asc', () => {
    renderIndex({ filters: {} })
    fireEvent.click(screen.getByText(/Start Date/))
    expect(router.get).toHaveBeenCalledWith(
      '/events',
      expect.objectContaining({ sort: 'date', direction: 'asc' }),
      expect.any(Object)
    )
  })

  it('clicking Place calls router.get with sort=place asc', () => {
    renderIndex({ filters: {} })
    fireEvent.click(screen.getByText(/Place/))
    expect(router.get).toHaveBeenCalledWith(
      '/events',
      expect.objectContaining({ sort: 'place', direction: 'asc' }),
      expect.any(Object)
    )
  })

  it('toggles to desc on second click of same column', () => {
    renderIndex({ filters: { sort: 'date', direction: 'asc' } })
    fireEvent.click(screen.getByText(/Start Date/))
    expect(router.get).toHaveBeenCalledWith(
      '/events',
      expect.objectContaining({ sort: 'date', direction: 'desc' }),
      expect.any(Object)
    )
  })

  it('shows ↑ for active asc sort', () => {
    renderIndex({ filters: { sort: 'date', direction: 'asc' } })
    expect(screen.getByText('↑')).toBeInTheDocument()
  })

  it('shows ↓ for active desc sort', () => {
    renderIndex({ filters: { sort: 'date', direction: 'desc' } })
    expect(screen.getByText('↓')).toBeInTheDocument()
  })

  it('shows ↕ for inactive column', () => {
    renderIndex({ filters: { sort: 'date', direction: 'asc' } })
    expect(screen.getByText('↕')).toBeInTheDocument()
  })
})

describe('Events Index — pagination', () => {
  it('renders prev/next buttons', () => {
    renderIndex()
    expect(screen.getByText('«')).toBeInTheDocument()
    expect(screen.getByText('»')).toBeInTheDocument()
  })

  it('shows total count', () => {
    renderIndex()
    expect(screen.getByText('Total: 62')).toBeInTheDocument()
  })

  it('disables prev on first page', () => {
    renderIndex({ meta: { ...PAGINATION, page: 1 } })
    expect(screen.getByText('«').closest('button')).toBeDisabled()
  })

  it('disables next on last page', () => {
    renderIndex({ meta: { ...PAGINATION, page: 3, total_pages: 3 } })
    expect(screen.getByText('»').closest('button')).toBeDisabled()
  })

  it('clicking page number navigates', () => {
    renderIndex({ meta: { ...PAGINATION, page: 1, total_pages: 3 } })
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(router.get).toHaveBeenCalledWith(
      '/events',
      expect.objectContaining({ page: 2 }),
      expect.any(Object)
    )
  })

  it('clicking next advances page', () => {
    renderIndex({ meta: { ...PAGINATION, page: 1 } })
    fireEvent.click(screen.getByText('»').closest('button'))
    expect(router.get).toHaveBeenCalledWith(
      '/events',
      expect.objectContaining({ page: 2 }),
      expect.any(Object)
    )
  })

  it('does not render pagination when only 1 page', () => {
    renderIndex({ meta: { ...PAGINATION, total_pages: 1 } })
    expect(screen.queryByText('«')).not.toBeInTheDocument()
  })

  it('preserves all filters when paginating', () => {
    renderIndex({
      meta: PAGINATION,
      filters: { q: 'test', sort: 'date', direction: 'asc', source_type: 'Book', source_id: '3' },
    })
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(router.get).toHaveBeenCalledWith(
      '/events',
      expect.objectContaining({
        q: 'test',
        sort: 'date',
        direction: 'asc',
        source_type: 'Book',
        source_id: '3',
        page: 2,
      }),
      expect.any(Object)
    )
  })
})
