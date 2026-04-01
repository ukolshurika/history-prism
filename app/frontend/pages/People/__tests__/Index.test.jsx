import { render, screen, fireEvent } from '@testing-library/react'
import { router } from '@inertiajs/react'
import Index from '../Index'

// Mock Inertia
jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className, onClick, title: t }) => (
    <a href={href} className={className} onClick={onClick} title={t}>
      {children}
    </a>
  ),
  router: { get: jest.fn(), delete: jest.fn() },
}))

// Mock Layout
jest.mock('../../Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

describe('People Index', () => {
  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  }

  const mockGedcomFiles = [
    { id: 1, name: 'Family Tree 2020' },
    { id: 2, name: 'Heritage Records' },
  ]

  const mockPeople = [
    {
      id: 1,
      full_name: 'John William Smith',
      first_name: 'John',
      middle_name: 'William',
      last_name: 'Smith',
      birth_year: 1950,
      death_year: 2020,
      events: [{ id: 1, title: 'Birth' }, { id: 2, title: 'Marriage' }],
      timelines: [{ id: 10, title: 'Life of John' }],
    },
    {
      id: 2,
      full_name: 'Jane Doe',
      first_name: 'Jane',
      last_name: 'Doe',
      birth_year: null,
      death_year: null,
      events: [],
      timelines: [],
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Heading', () => {
    it('renders "People" heading', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      expect(screen.getByRole('heading', { name: 'People' })).toBeInTheDocument()
    })
  })

  describe('Add Person link', () => {
    it('shows "Add Person" link when current_user is present', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      const addPersonLinks = screen.getAllByText('Add Person')
      expect(addPersonLinks.length).toBeGreaterThan(0)
      expect(addPersonLinks[0].closest('a')).toHaveAttribute('href', '/people/new')
    })

    it('does not show "Add Person" link when no current_user', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={null} flash={{}} />
      )

      expect(screen.queryByText('Add Person')).not.toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('shows "No people yet." when people is empty', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={null} flash={{}} />
      )

      expect(screen.getByText('No people yet.')).toBeInTheDocument()
    })

    it('shows "Add the first person" link when people is empty and current_user is present', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      const addFirstLink = screen.getByText('Add the first person')
      expect(addFirstLink.closest('a')).toHaveAttribute('href', '/people/new')
    })

    it('does not show "Add the first person" link when no current_user', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={null} flash={{}} />
      )

      expect(screen.queryByText('Add the first person')).not.toBeInTheDocument()
    })
  })

  describe('Person cards', () => {
    it('renders person cards with full_name', () => {
      render(
        <Index people={mockPeople} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      expect(screen.getByText('John William Smith')).toBeInTheDocument()
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })

    it('renders birth_year and death_year when present', () => {
      render(
        <Index people={[mockPeople[0]]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      expect(screen.getByText('1950 – 2020')).toBeInTheDocument()
    })

    it('does not render birth/death years when absent', () => {
      render(
        <Index people={[mockPeople[1]]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      expect(screen.queryByText(/–/)).not.toBeInTheDocument()
    })

    it('renders events count when person has events', () => {
      render(
        <Index people={[mockPeople[0]]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      expect(screen.getByText('2 events')).toBeInTheDocument()
    })

    it('does not render events count when person has no events', () => {
      render(
        <Index people={[mockPeople[1]]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      expect(screen.queryByText(/event/)).not.toBeInTheDocument()
    })

    it('renders timeline links when person has timelines', () => {
      render(
        <Index people={[mockPeople[0]]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      const timelineLink = screen.getByText('Life of John').closest('a')
      expect(timelineLink).toHaveAttribute('href', '/timelines/10')
    })

    it('renders "New timeline" link for each person', () => {
      render(
        <Index people={mockPeople} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      const newTimelineLinks = screen.getAllByText('New timeline')
      expect(newTimelineLinks).toHaveLength(mockPeople.length)
      expect(newTimelineLinks[0].closest('a')).toHaveAttribute('href', `/timelines/new?person_id=${mockPeople[0].id}`)
    })
  })

  describe('Pagination', () => {
    const mockPagination = {
      page: 1,
      total_pages: 3,
      total: 75,
      per_page: 25,
    }

    it('does not show pagination when total_pages is 1', () => {
      render(
        <Index people={mockPeople} gedcom_files={[]} current_user={mockCurrentUser} flash={{}}
          meta={{ page: 1, total_pages: 1, total: 2, per_page: 25 }}
          filters={{}}
        />
      )
      expect(screen.queryByRole('button', { name: '«' })).not.toBeInTheDocument()
    })

    it('shows pagination when total_pages > 1', () => {
      render(
        <Index people={mockPeople} gedcom_files={[]} current_user={mockCurrentUser} flash={{}}
          meta={mockPagination} filters={{}}
        />
      )
      expect(screen.getByRole('button', { name: '«' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '»' })).toBeInTheDocument()
    })

    it('shows total count', () => {
      render(
        <Index people={mockPeople} gedcom_files={[]} current_user={mockCurrentUser} flash={{}}
          meta={mockPagination} filters={{}}
        />
      )
      expect(screen.getByText('Total: 75')).toBeInTheDocument()
    })

    it('prev button is disabled on first page', () => {
      render(
        <Index people={mockPeople} gedcom_files={[]} current_user={mockCurrentUser} flash={{}}
          meta={mockPagination} filters={{}}
        />
      )
      expect(screen.getByRole('button', { name: '«' })).toBeDisabled()
    })

    it('next button is disabled on last page', () => {
      render(
        <Index people={mockPeople} gedcom_files={[]} current_user={mockCurrentUser} flash={{}}
          meta={{ ...mockPagination, page: 3 }} filters={{}}
        />
      )
      expect(screen.getByRole('button', { name: '»' })).toBeDisabled()
    })

    it('calls router.get with next page when clicking next', () => {
      render(
        <Index people={mockPeople} gedcom_files={[]} current_user={mockCurrentUser} flash={{}}
          meta={mockPagination} filters={{}}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: '»' }))
      expect(router.get).toHaveBeenCalledWith('/people', expect.objectContaining({ page: 2 }), expect.any(Object))
    })

    it('calls router.get with prev page when clicking prev', () => {
      render(
        <Index people={mockPeople} gedcom_files={[]} current_user={mockCurrentUser} flash={{}}
          meta={{ ...mockPagination, page: 2 }} filters={{}}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: '«' }))
      expect(router.get).toHaveBeenCalledWith('/people', expect.objectContaining({ page: 1 }), expect.any(Object))
    })

    it('preserves filters when paginating', () => {
      render(
        <Index people={mockPeople} gedcom_files={[]} current_user={mockCurrentUser} flash={{}}
          meta={mockPagination}
          filters={{ q: { first_name_cont: 'John' } }}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: '»' }))
      expect(router.get).toHaveBeenCalledWith('/people', expect.objectContaining({
        page: 2,
        'q[first_name_cont]': 'John',
      }), expect.any(Object))
    })
  })

  describe('Filter persistence', () => {
    it('initializes name filter from filters prop', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}}
          filters={{ q: { name_cont: 'Smith' } }}
        />
      )
      expect(screen.getByLabelText('Name')).toHaveValue('Smith')
    })

    it('initializes first_name filter from filters prop', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}}
          filters={{ q: { first_name_cont: 'John' } }}
        />
      )
      expect(screen.getByLabelText('First Name')).toHaveValue('John')
    })

    it('initializes last_name filter from filters prop', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}}
          filters={{ q: { last_name_cont: 'Doe' } }}
        />
      )
      expect(screen.getByLabelText('Last Name')).toHaveValue('Doe')
    })
  })

  describe('Search form', () => {
    it('has Name field', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      expect(screen.getByLabelText('Name')).toBeInTheDocument()
    })

    it('has First Name field', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
    })

    it('has Middle Name field', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      expect(screen.getByLabelText('Middle Name')).toBeInTheDocument()
    })

    it('has Last Name field', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
    })

    it('has GEDCOM File field', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      expect(screen.getByLabelText('GEDCOM File')).toBeInTheDocument()
    })

    it('Reset button exists', () => {
      render(
        <Index people={[]} gedcom_files={[]} current_user={mockCurrentUser} flash={{}} />
      )

      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    })

    it('GEDCOM file dropdown shows options from gedcom_files prop', () => {
      render(
        <Index people={[]} gedcom_files={mockGedcomFiles} current_user={mockCurrentUser} flash={{}} />
      )

      expect(screen.getByText('Family Tree 2020')).toBeInTheDocument()
      expect(screen.getByText('Heritage Records')).toBeInTheDocument()
    })

    it('GEDCOM file dropdown has "All Files" default option', () => {
      render(
        <Index people={[]} gedcom_files={mockGedcomFiles} current_user={mockCurrentUser} flash={{}} />
      )

      expect(screen.getByText('All Files')).toBeInTheDocument()
    })
  })
})
