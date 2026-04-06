import { render, screen, fireEvent } from '@testing-library/react'
import Show from '../Show'

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => <a href={href} className={className}>{children}</a>,
  useForm: jest.fn(() => ({
    data: {
      event: {
        title: '',
        description: '',
        category: 'local',
        timeline_id: 1,
        start_date_attributes: { date_type: 'exact', year: '', month: '', day: '' },
        end_date_attributes: { date_type: 'exact', year: '', month: '', day: '' },
      }
    },
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
          start_date_text: 'exact 1900-01-01',
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
          start_date_text: 'exact 1900-01-01',
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
          start_date_text: 'exact 1910-05-15',
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
          start_date_text: 'exact 1914-07-28',
          is_multi_year: true,
          description: 'The Great War',
        },
      ],
    },
  }

  beforeEach(() => {
    const router = getRouter()
    router.delete.mockClear()
    router.put.mockClear()
    router.post.mockClear()
  })

  it('renders timeline.title as heading', () => {
    render(
      <Show
        timeline={mockTimeline}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    expect(screen.getByRole('heading', { name: 'Test Timeline' })).toBeInTheDocument()
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

  it('shows "Back to Timelines" link', () => {
    render(
      <Show
        timeline={mockTimeline}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const backLink = screen.getByText('Back to Timelines').closest('a')
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/timelines')
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
            start_date_text: 'exact 1910-05-15',
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
    expect(screen.getByRole('button', { name: /Remove from timeline/i })).toBeInTheDocument()
    expect(screen.queryByText(/^Selected Event$/i)).not.toBeInTheDocument()
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

  it('clicking Local add control opens CreateEventForm modal with category "local"', () => {
    const { container } = render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const addLocalButton = container.querySelector('[title="Add Local event"]')
    fireEvent.click(addLocalButton)

    expect(screen.getByText('Create New Event (local)')).toBeInTheDocument()
  })

  it('CreateEventForm has Title and Description fields', () => {
    const { container } = render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const addLocalButton = container.querySelector('[title="Add Local event"]')
    fireEvent.click(addLocalButton)

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
  })

  it('CreateEventForm has Start Date section', () => {
    const { container } = render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const addLocalButton = container.querySelector('[title="Add Local event"]')
    fireEvent.click(addLocalButton)

    expect(screen.getByText('Start Date *')).toBeInTheDocument()
  })

  it('CreateEventForm has Create Event and Cancel buttons', () => {
    const { container } = render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const addLocalButton = container.querySelector('[title="Add Local event"]')
    fireEvent.click(addLocalButton)

    expect(screen.getByRole('button', { name: /Create Event/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
  })

  it('clicking Cancel closes the CreateEventForm modal', () => {
    const { container } = render(
      <Show
        timeline={mockTimelineWithAllTracks}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    )

    const addLocalButton = container.querySelector('[title="Add Local event"]')
    fireEvent.click(addLocalButton)

    // Modal is open
    expect(screen.getByText('Create New Event (local)')).toBeInTheDocument()

    // Click Cancel button inside the modal
    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    // Modal should be closed
    expect(screen.queryByText('Create New Event (local)')).not.toBeInTheDocument()
  })
})
