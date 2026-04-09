import { render, screen, fireEvent } from '@testing-library/react'
import Show from '../Show'

const mockCalls = {
  post: jest.fn(),
  put: jest.fn(),
  setData: jest.fn(),
}
const mockFetch = jest.fn()

const defaultSearchResponse = {
  events: [
    {
      id: 21,
      title: 'Local Event',
      category: 'local',
      description: 'Nearby event',
      start_date_display: '1910-05-15',
      location: { place: 'Moscow' },
    },
  ],
  meta: { page: 1, per_page: 25, total: 1, total_pages: 1 },
}

function mockFetchResponse(payload = defaultSearchResponse) {
  return {
    ok: true,
    json: () => Promise.resolve(payload),
  }
}

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => <a href={href} className={className}>{children}</a>,
  useForm: jest.fn((initialData) => ({
    data: initialData,
    setData: mockCalls.setData,
    post: mockCalls.post,
    put: mockCalls.put,
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

global.fetch = mockFetch

// Mock Layout
jest.mock('../../Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

// Helper to access the mocked router
const getRouter = () => require('@inertiajs/react').router

describe('Timelines Show', () => {
  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  }

  const mockTimeline = {
    id: 1,
    title: 'Test Timeline',
    person_id: 1,
    person_name: 'John Doe',
    start_at: '1900-01-01',
    end_at: '1950-12-31',
    visible: false,
    created_at: '2024-01-01T00:00:00Z',
    pdf_url: null,
    pdf_generated_at: null,
    cached_events_for_display: {},
    categorized_events: {
      personal: [
        {
          id: 1,
          title: 'Birth',
          category: 'person',
          start_year: 1900,
          start_month: 1,
          start_day: 1,
          end_year: 1900,
          end_month: 1,
          end_day: 1,
          start_date_text: '01/01/1900',
          is_multi_year: false,
          description: 'Born',
        },
      ],
      local: [],
      world: [],
    },
  }

  const mockTimelineEmpty = {
    ...mockTimeline,
    categorized_events: {
      personal: [],
      local: [],
      world: [],
    },
  }

  const mockTimelineWithAllTracks = {
    ...mockTimeline,
    cached_events_for_display: {
      person: [1],
      local: [2],
      world: [3],
    },
    categorized_events: {
      personal: [
        {
          id: 1,
          title: 'Birth',
          category: 'person',
          start_year: 1900,
          start_month: 1,
          start_day: 1,
          end_year: 1900,
          end_month: 1,
          end_day: 1,
          start_date_text: '01/01/1900',
          is_multi_year: false,
          description: 'Born',
        },
      ],
      local: [
        {
          id: 2,
          title: 'Local Event',
          category: 'local',
          start_year: 1910,
          start_month: 5,
          start_day: 15,
          end_year: 1910,
          end_month: 5,
          end_day: 15,
          start_date_text: '15/05/1910',
          is_multi_year: false,
          description: '',
        },
      ],
      world: [
        {
          id: 3,
          title: 'World War I',
          category: 'world',
          start_year: 1914,
          start_month: 7,
          start_day: 28,
          end_year: 1918,
          end_month: 11,
          end_day: 11,
          start_date_text: '28/07/1914',
          end_date_text: '11/11/1918',
          is_multi_year: true,
          description: 'The Great War',
          source_url: '/rails/active_storage/blobs/book.pdf#page=42',
        },
      ],
    },
  }

  beforeEach(() => {
    const router = getRouter()
    router.delete.mockClear()
    router.put.mockClear()
    router.post.mockClear()
    mockCalls.post.mockClear()
    mockCalls.put.mockClear()
    mockCalls.setData.mockClear()
    mockFetch.mockReset()
    mockFetch.mockResolvedValue(mockFetchResponse())
  })

  it('renders person name as heading', () => {
    render(
      <Show
        timeline={mockTimeline}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getByRole('heading', { name: 'John Doe' })).toBeInTheDocument()
  })

  it('shows person name', () => {
    render(
      <Show
        timeline={mockTimeline}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('links the subject block to the person page', () => {
    render(
      <Show
        timeline={mockTimeline}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const personLink = screen.getByText('John Doe').closest('a')
    expect(personLink).toBeInTheDocument()
    expect(personLink).toHaveAttribute('href', '/people/1')
  })

  it('shows breadcrumb link to timelines index', () => {
    render(
      <Show
        timeline={mockTimeline}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const breadcrumbLink = screen.getAllByText('Timeline').find((node) => node.closest('a'))?.closest('a')
    expect(breadcrumbLink).toBeInTheDocument()
    expect(breadcrumbLink).toHaveAttribute('href', '/timelines')
    expect(screen.getByText('Test Timeline')).toBeInTheDocument()
  })

  it('shows Edit link when can_edit is true', () => {
    render(
      <Show
        timeline={mockTimeline}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const editLink = screen.getByText('Edit').closest('a')
    expect(editLink).toBeInTheDocument()
    expect(editLink).toHaveAttribute('href', '/timelines/1/edit')
  })

  it('does not show Edit link when can_edit is false', () => {
    render(
      <Show
        timeline={mockTimeline}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  it('shows "Generate PDF" button when can_edit is true', () => {
    render(
      <Show
        timeline={mockTimeline}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getByRole('button', { name: /Generate PDF/i })).toBeInTheDocument()
  })

  it('posts to export_pdf when clicking "Generate PDF"', () => {
    const router = getRouter()

    render(
      <Show
        timeline={mockTimeline}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Generate PDF/i }))

    expect(router.post).toHaveBeenCalledWith('/timelines/1/export_pdf')
  })

  it('does not show "Generate PDF" button when can_edit is false', () => {
    render(
      <Show
        timeline={mockTimeline}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.queryByRole('button', { name: /Generate PDF/i })).not.toBeInTheDocument()
  })

  it('shows "Download PDF" link when timeline.pdf_url is set', () => {
    const timelineWithPdf = {
      ...mockTimeline,
      pdf_url: '/pdfs/timeline_1.pdf',
    }

    render(
      <Show
        timeline={timelineWithPdf}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getByText('Download PDF')).toBeInTheDocument()
  })

  it('does not show "Download PDF" link when pdf_url is null', () => {
    render(
      <Show
        timeline={mockTimeline}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.queryByText('Download PDF')).not.toBeInTheDocument()
  })

  it('shows "Personal", "Local", "World" track headers when events are present', () => {
    render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getAllByText('Personal').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Local').length).toBeGreaterThan(0)
    expect(screen.getAllByText('World').length).toBeGreaterThan(0)
  })

  it('does not show prototype labels in the main timeline surface', () => {
    render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.queryByText('Strata')).not.toBeInTheDocument()
    expect(screen.queryByText('Ribbon')).not.toBeInTheDocument()
    expect(screen.queryByText('Pulse')).not.toBeInTheDocument()
  })

  it('shows discrete scale modes instead of a continuous slider value', () => {
    render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getByRole('button', { name: '10 Years' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5 Years' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1 Year' })).toBeInTheDocument()
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  })

  it('keeps the inline event details closed on initial load', () => {
    render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.queryByText('The Great War')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Close event details/i })).not.toBeInTheDocument()
  })

  it('shows "No events available yet" when all categorized_events are empty', () => {
    render(
      <Show
        timeline={mockTimelineEmpty}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getByText(/No events available yet/i)).toBeInTheDocument()
  })

  it('renders event titles in the correct track when events are present', () => {
    render(
      <Show
        timeline={mockTimeline}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getAllByText('Birth').length).toBeGreaterThan(0)
  })

  it('renders event title in the local track', () => {
    const timelineWithLocal = {
      ...mockTimeline,
      categorized_events: {
        personal: [],
        local: [
          {
            id: 2,
            title: 'Local Event',
            category: 'local',
            start_year: 1910,
            start_month: 5,
            start_day: 15,
            end_year: 1910,
            end_month: 5,
            end_day: 15,
            start_date_text: '15/05/1910',
            is_multi_year: false,
            description: '',
          },
        ],
        world: [],
      },
    }

    render(
      <Show
        timeline={timelineWithLocal}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getAllByText('Local Event').length).toBeGreaterThan(0)
  })

  it('opens selected event details inline within the timeline section', () => {
    render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /World War I/i }))

    expect(screen.getAllByText('World War I').length).toBeGreaterThan(1)
    expect(screen.getByText('The Great War')).toBeInTheDocument()
    expect(screen.getAllByText('28/07/1914 - 11/11/1918').length).toBeGreaterThan(1)
    expect(screen.getByRole('button', { name: /Remove from timeline/i })).toBeInTheDocument()
    expect(screen.queryByText(/^Selected Event$/i)).not.toBeInTheDocument()
  })

  it('shows source link in inline event details when source_url is present', () => {
    render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /World War I/i }))

    const sourceLink = screen.getByRole('link', { name: 'Source' })
    expect(sourceLink).toBeInTheDocument()
    expect(sourceLink).toHaveAttribute('href', '/rails/active_storage/blobs/book.pdf#page=42')
  })

  it('does not show source link for event without source_url', () => {
    render(
      <Show
        timeline={mockTimeline}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Birth/i }))

    expect(screen.queryByRole('link', { name: 'Source' })).not.toBeInTheDocument()
  })

  it('allows closing the inline event details block', () => {
    render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /World War I/i }))
    expect(screen.getByText('The Great War')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Close event details/i }))
    expect(screen.queryByText('The Great War')).not.toBeInTheDocument()
  })

  it('closes inline event details when clicking the selected event again', () => {
    render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const eventButton = screen.getByRole('button', { name: /World War I/i })

    fireEvent.click(eventButton)
    expect(screen.getByText('The Great War')).toBeInTheDocument()

    fireEvent.click(eventButton)
    expect(screen.queryByText('The Great War')).not.toBeInTheDocument()
  })

  it('opens an edit popup from inline event details', () => {
    render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /World War I/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Edit$/i }))

    expect(screen.getByDisplayValue('World War I')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Update Event/i })).toBeInTheDocument()
  })

  it('submits the event update from the edit popup', () => {
    render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /World War I/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Edit$/i }))
    fireEvent.change(screen.getByDisplayValue('World War I'), { target: { value: 'Edited Event' } })
    fireEvent.click(screen.getByRole('button', { name: /Update Event/i }))

    expect(mockCalls.put).toHaveBeenCalledWith(
      '/events/3',
      expect.any(Object)
    )
  })

  it('shows add controls on each track when can_edit is true', () => {
    const { container } = render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(container.querySelector('[title="Add Personal event"]')).toBeInTheDocument()
    expect(container.querySelector('[title="Add Local event"]')).toBeInTheDocument()
    expect(container.querySelector('[title="Add World event"]')).toBeInTheDocument()
  })

  it('does not show add controls when can_edit is false', () => {
    const { container } = render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(container.querySelector('[title="Add Personal event"]')).not.toBeInTheDocument()
    expect(container.querySelector('[title="Add Local event"]')).not.toBeInTheDocument()
    expect(container.querySelector('[title="Add World event"]')).not.toBeInTheDocument()
  })

  it('clicking Local add control opens the search modal and shows results', async () => {
    const { container } = render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    fireEvent.click(container.querySelector('[title="Add Local event"]'))

    expect(screen.getByText('Search Existing Events (Local)')).toBeInTheDocument()
    expect(await screen.findByText('Local Event')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Event/i })).toBeInTheDocument()
  })

  it('switches the search modal to advanced search and exposes location filters', async () => {
    const { container } = render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    fireEvent.click(container.querySelector('[title="Add Local event"]'))
    fireEvent.click(screen.getByRole('button', { name: 'Advanced Search' }))

    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Latitude')).toBeInTheDocument()
    expect(screen.getByLabelText('Longitude')).toBeInTheDocument()
    expect(screen.getByLabelText('Radius (km)')).toBeInTheDocument()
  })

  it('clicking Create Event in the search modal opens the create form for the current category', async () => {
    const { container } = render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    fireEvent.click(container.querySelector('[title="Add Local event"]'))
    await screen.findByText('Local Event')
    fireEvent.click(screen.getByRole('button', { name: /Create Event/i }))

    expect(await screen.findByLabelText(/Title/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Event/i })).toBeInTheDocument()
  })

  it('attaches a found event to the timeline from the search modal', async () => {
    const router = getRouter()
    const { container } = render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={true}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    fireEvent.click(container.querySelector('[title="Add Local event"]'))
    fireEvent.click(await screen.findByRole('button', { name: 'Attach Event' }))

    expect(router.put).toHaveBeenCalledWith(
      '/timelines/1',
      {
        timeline: {
          cached_events_for_display: {
            person: [1],
            local: [2, 21],
            world: [3],
          },
        },
      },
      expect.objectContaining({ preserveScroll: true, onSuccess: expect.any(Function) })
    )
  })

  it('clicking Personal add control opens the create form directly', () => {
    const { container } = render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    fireEvent.click(container.querySelector('[title="Add Personal event"]'))

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    expect(screen.getByText('Start Date *')).toBeInTheDocument()
  })

  it('clicking Cancel closes the create form from the search flow', async () => {
    const { container } = render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    fireEvent.click(container.querySelector('[title="Add Local event"]'))
    await screen.findByText('Local Event')
    fireEvent.click(screen.getByRole('button', { name: /Create Event/i }))

    expect(await screen.findByLabelText(/Title/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))

    expect(screen.queryByLabelText(/Title/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Search Existing Events (Local)')).not.toBeInTheDocument()
  })
})
