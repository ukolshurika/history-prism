import { render, screen, fireEvent } from '@testing-library/react'
import Show from '../Show'
import * as InertiaReact from '@inertiajs/react'

// Mock Inertia
jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className, onClick, title: t }) => (
    <a href={href} className={className} onClick={onClick} title={t}>
      {children}
    </a>
  ),
  router: { delete: jest.fn(), get: jest.fn() },
}))

// Mock Layout
jest.mock('../../Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

describe('People Show', () => {
  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  }

  const mockPerson = {
    id: 42,
    full_name: 'John William Smith',
    first_name: 'John',
    middle_name: 'William',
    last_name: 'Smith',
    gedcom_uuid: 'I0001',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-01T12:00:00Z',
    events: [],
  }

  const mockPersonNoMiddleOrLast = {
    id: 5,
    full_name: 'Alice',
    first_name: 'Alice',
    middle_name: null,
    last_name: null,
    gedcom_uuid: 'I0005',
    created_at: '2024-03-01T08:00:00Z',
    events: [],
  }

  const mockEvents = [
    {
      id: 101,
      title: 'Birth of John',
      description: 'Born in Springfield',
      start_date_display: '1950',
      category: 'birth',
    },
    {
      id: 102,
      title: 'Marriage',
      description: 'Married Jane',
      start_date_display: '1975',
      category: 'marriage',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Heading', () => {
    it('renders person.full_name as heading', () => {
      render(
        <Show
          person={mockPerson}
          can_edit={false}
          can_delete={false}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      expect(screen.getByRole('heading', { name: 'John William Smith' })).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('shows "Back to People" link to /people', () => {
      render(
        <Show
          person={mockPerson}
          can_edit={false}
          can_delete={false}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      const backLink = screen.getByText(/Back to People/).closest('a')
      expect(backLink).toHaveAttribute('href', '/people')
    })
  })

  describe('Person fields', () => {
    it('shows First Name field value', () => {
      render(
        <Show
          person={mockPerson}
          can_edit={false}
          can_delete={false}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      expect(screen.getByText('First Name')).toBeInTheDocument()
      expect(screen.getByText('John')).toBeInTheDocument()
    })

    it('shows Middle Name when present', () => {
      render(
        <Show
          person={mockPerson}
          can_edit={false}
          can_delete={false}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      expect(screen.getByText('Middle Name')).toBeInTheDocument()
      expect(screen.getByText('William')).toBeInTheDocument()
    })

    it('does not show Middle Name when absent', () => {
      render(
        <Show
          person={mockPersonNoMiddleOrLast}
          can_edit={false}
          can_delete={false}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      expect(screen.queryByText('Middle Name')).not.toBeInTheDocument()
    })

    it('shows Last Name when present', () => {
      render(
        <Show
          person={mockPerson}
          can_edit={false}
          can_delete={false}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      expect(screen.getByText('Last Name')).toBeInTheDocument()
      expect(screen.getByText('Smith')).toBeInTheDocument()
    })

    it('does not show Last Name when absent', () => {
      render(
        <Show
          person={mockPersonNoMiddleOrLast}
          can_edit={false}
          can_delete={false}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      expect(screen.queryByText('Last Name')).not.toBeInTheDocument()
    })

    it('shows GEDCOM UUID', () => {
      render(
        <Show
          person={mockPerson}
          can_edit={false}
          can_delete={false}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      expect(screen.getByText('GEDCOM UUID')).toBeInTheDocument()
      expect(screen.getByText('I0001')).toBeInTheDocument()
    })
  })

  describe('Action buttons', () => {
    it('shows Edit link to /people/:id/edit when can_edit=true', () => {
      render(
        <Show
          person={mockPerson}
          can_edit={true}
          can_delete={false}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      const editLink = screen.getByText('Edit').closest('a')
      expect(editLink).toHaveAttribute('href', `/people/${mockPerson.id}/edit`)
    })

    it('shows Delete button when can_delete=true', () => {
      render(
        <Show
          person={mockPerson}
          can_edit={false}
          can_delete={true}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    })

    it('does not show action buttons when can_edit=false and can_delete=false', () => {
      render(
        <Show
          person={mockPerson}
          can_edit={false}
          can_delete={false}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
    })
  })

  describe('Delete functionality', () => {
    it('calls confirm() when Delete button is clicked', () => {
      global.confirm = jest.fn(() => true)

      render(
        <Show
          person={mockPerson}
          can_edit={false}
          can_delete={true}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this person?')
    })

    it('calls router.delete when confirm returns true', () => {
      global.confirm = jest.fn(() => true)

      render(
        <Show
          person={mockPerson}
          can_edit={false}
          can_delete={true}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      expect(InertiaReact.router.delete).toHaveBeenCalledWith(`/people/${mockPerson.id}`)
    })

    it('does NOT call router.delete when confirm is cancelled', () => {
      global.confirm = jest.fn(() => false)

      render(
        <Show
          person={mockPerson}
          can_edit={false}
          can_delete={true}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      expect(InertiaReact.router.delete).not.toHaveBeenCalled()
    })
  })

  describe('Associated events', () => {
    it('shows associated events section when person.events is present', () => {
      render(
        <Show
          person={{ ...mockPerson, events: mockEvents }}
          can_edit={false}
          can_delete={false}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      expect(screen.getByText('Associated Events')).toBeInTheDocument()
      expect(screen.getByText('Birth of John')).toBeInTheDocument()
      expect(screen.getByText('Marriage')).toBeInTheDocument()
    })

    it('does not show events section when person.events is empty', () => {
      render(
        <Show
          person={mockPerson}
          can_edit={false}
          can_delete={false}
          current_user={mockCurrentUser}
          flash={{}}
        />
      )

      expect(screen.queryByText('Associated Events')).not.toBeInTheDocument()
    })
  })
})
