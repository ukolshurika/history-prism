import { render, screen, fireEvent } from '@testing-library/react'
import Form from '../Form'

// Mock Inertia
const mockPost = jest.fn()
const mockPut = jest.fn()
const mockDelete = jest.fn()

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className, onClick, title: t }) => (
    <a href={href} className={className} onClick={onClick} title={t}>
      {children}
    </a>
  ),
  useForm: () => ({
    data: {
      person: {
        name: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        gedcom_uuid: '',
        event_ids: [],
      },
    },
    setData: jest.fn(),
    post: mockPost,
    put: mockPut,
    processing: false,
    errors: {},
  }),
  router: { delete: mockDelete, get: jest.fn() },
}))

// Mock Layout
jest.mock('../../Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

describe('People Form', () => {
  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  }

  const mockNewPerson = {
    name: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    gedcom_uuid: '',
    event_ids: [],
  }

  const mockExistingPerson = {
    id: 7,
    name: 'John Smith',
    first_name: 'John',
    middle_name: 'William',
    last_name: 'Smith',
    gedcom_uuid: 'I0007',
    event_ids: [],
  }

  const mockEvents = [
    { id: 1, title: 'Birth of John', start_date: '1950-01-01' },
    { id: 2, title: 'Marriage Ceremony', start_date: '1975-06-15' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Create mode', () => {
    it('renders "Add New Person" heading', () => {
      render(
        <Form
          person={mockNewPerson}
          events={[]}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByRole('heading', { name: 'Add New Person' })).toBeInTheDocument()
    })

    it('submit calls post("/people")', () => {
      render(
        <Form
          person={mockNewPerson}
          events={[]}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      fireEvent.submit(screen.getByRole('button', { name: 'Add Person' }).closest('form'))

      expect(mockPost).toHaveBeenCalledWith('/people')
      expect(mockPut).not.toHaveBeenCalled()
    })
  })

  describe('Edit mode', () => {
    it('renders "Edit Person" heading', () => {
      render(
        <Form
          person={mockExistingPerson}
          events={[]}
          isEdit={true}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByRole('heading', { name: 'Edit Person' })).toBeInTheDocument()
    })

    it('submit calls put("/people/:id")', () => {
      render(
        <Form
          person={mockExistingPerson}
          events={[]}
          isEdit={true}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      fireEvent.submit(screen.getByRole('button', { name: 'Update Person' }).closest('form'))

      expect(mockPut).toHaveBeenCalledWith(`/people/${mockExistingPerson.id}`)
      expect(mockPost).not.toHaveBeenCalled()
    })
  })

  describe('Form fields', () => {
    it('renders Name field', () => {
      render(
        <Form
          person={mockNewPerson}
          events={[]}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByLabelText('Name *')).toBeInTheDocument()
    })

    it('renders First Name field', () => {
      render(
        <Form
          person={mockNewPerson}
          events={[]}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByLabelText('First Name *')).toBeInTheDocument()
    })

    it('renders Middle Name field', () => {
      render(
        <Form
          person={mockNewPerson}
          events={[]}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByLabelText('Middle Name')).toBeInTheDocument()
    })

    it('renders Last Name field', () => {
      render(
        <Form
          person={mockNewPerson}
          events={[]}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
    })

    it('renders GEDCOM UUID field', () => {
      render(
        <Form
          person={mockNewPerson}
          events={[]}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByLabelText('GEDCOM UUID *')).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('shows errors when errors array is not empty', () => {
      const errors = ['Name is required', 'GEDCOM UUID already taken']

      render(
        <Form
          person={mockNewPerson}
          events={[]}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={errors}
        />
      )

      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('GEDCOM UUID already taken')).toBeInTheDocument()
    })

    it('does not show error section when errors array is empty', () => {
      render(
        <Form
          person={mockNewPerson}
          events={[]}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.queryByText(/is required/i)).not.toBeInTheDocument()
    })
  })

  describe('Events select', () => {
    it('shows "No person-type events available" when events=[]', () => {
      render(
        <Form
          person={mockNewPerson}
          events={[]}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByText('No person-type events available')).toBeInTheDocument()
    })

    it('shows events in select when events are provided', () => {
      render(
        <Form
          person={mockNewPerson}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      expect(screen.getByText(/Birth of John/)).toBeInTheDocument()
      expect(screen.getByText(/Marriage Ceremony/)).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('Cancel link goes to /people', () => {
      render(
        <Form
          person={mockNewPerson}
          events={[]}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      const cancelLink = screen.getByText('Cancel').closest('a')
      expect(cancelLink).toHaveAttribute('href', '/people')
    })

    it('"Back to People" link goes to /people', () => {
      render(
        <Form
          person={mockNewPerson}
          events={[]}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      )

      const backLink = screen.getByText(/Back to People/).closest('a')
      expect(backLink).toHaveAttribute('href', '/people')
    })
  })
})
