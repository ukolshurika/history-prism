import { render, screen, fireEvent } from '@testing-library/react'
import Form from '../Form'

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => <a href={href} className={className}>{children}</a>,
  useForm: jest.fn(() => ({
    data: {
      title: '',
      person_id: '',
      visible: false,
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

// Helper to access the mocked useForm
const getUseForm = () => require('@inertiajs/react').useForm

describe('Timelines Form', () => {
  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  }

  const mockPeople = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ]

  const mockNewTimeline = {
    title: '',
    person_id: '',
    visible: false,
  }

  const mockExistingTimeline = {
    id: 1,
    title: 'Family Timeline',
    person_id: 1,
    visible: true,
  }

  let mockPost
  let mockPatch

  beforeEach(() => {
    mockPost = jest.fn()
    mockPatch = jest.fn()
    getUseForm().mockReturnValue({
      data: {
        title: '',
        person_id: '',
        visible: false,
      },
      setData: jest.fn(),
      post: mockPost,
      patch: mockPatch,
      processing: false,
      errors: {},
    })
  })

  describe('Create Mode', () => {
    it('renders "Create New Timeline" heading', () => {
      render(
        <Form
          timeline={mockNewTimeline}
          people={mockPeople}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      expect(screen.getByText('Create New Timeline')).toBeInTheDocument()
    })

    it('renders Title input field that is required', () => {
      render(
        <Form
          timeline={mockNewTimeline}
          people={mockPeople}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const titleInput = screen.getByLabelText(/Title/i)
      expect(titleInput).toBeInTheDocument()
      expect(titleInput).toHaveAttribute('required')
    })

    it('renders Person select with people options', () => {
      render(
        <Form
          timeline={mockNewTimeline}
          people={mockPeople}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const personSelect = screen.getByLabelText(/Person/i)
      expect(personSelect).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('renders "Make this timeline public" checkbox', () => {
      render(
        <Form
          timeline={mockNewTimeline}
          people={mockPeople}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      expect(screen.getByText('Make this timeline public')).toBeInTheDocument()
    })

    it('calls post("/timelines") on submit in create mode', () => {
      render(
        <Form
          timeline={mockNewTimeline}
          people={mockPeople}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const form = screen.getByRole('button', { name: /Create Timeline/i }).closest('form')
      fireEvent.submit(form)

      expect(mockPost).toHaveBeenCalledWith('/timelines')
    })

    it('does not show person cannot be changed hint in create mode', () => {
      render(
        <Form
          timeline={mockNewTimeline}
          people={mockPeople}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      expect(screen.queryByText('Person cannot be changed after creation')).not.toBeInTheDocument()
    })
  })

  describe('Edit Mode', () => {
    it('renders "Edit Timeline" heading', () => {
      render(
        <Form
          timeline={mockExistingTimeline}
          people={mockPeople}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )

      expect(screen.getByText('Edit Timeline')).toBeInTheDocument()
    })

    it('calls patch("/timelines/:id") on submit in edit mode', () => {
      render(
        <Form
          timeline={mockExistingTimeline}
          people={mockPeople}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )

      const form = screen.getByRole('button', { name: /Update Timeline/i }).closest('form')
      fireEvent.submit(form)

      expect(mockPatch).toHaveBeenCalledWith('/timelines/1')
    })

    it('person select is disabled in edit mode', () => {
      render(
        <Form
          timeline={mockExistingTimeline}
          people={mockPeople}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )

      const personSelect = screen.getByLabelText(/Person/i)
      expect(personSelect).toBeDisabled()
    })

    it('shows "Person cannot be changed after creation" hint in edit mode', () => {
      render(
        <Form
          timeline={mockExistingTimeline}
          people={mockPeople}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )

      expect(screen.getByText('Person cannot be changed after creation')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('shows errors list when errors array is not empty', () => {
      const errors = ["Title can't be blank", 'Person must exist']

      render(
        <Form
          timeline={mockNewTimeline}
          people={mockPeople}
          current_user={mockCurrentUser}
          flash={{}}
          errors={errors}
          isEdit={false}
        />
      )

      expect(screen.getByText("Title can't be blank")).toBeInTheDocument()
      expect(screen.getByText('Person must exist')).toBeInTheDocument()
    })

    it('does not show errors section when errors array is empty', () => {
      render(
        <Form
          timeline={mockNewTimeline}
          people={mockPeople}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('Cancel link goes to /timelines', () => {
      render(
        <Form
          timeline={mockNewTimeline}
          people={mockPeople}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const cancelLink = screen.getByText('Cancel').closest('a')
      expect(cancelLink).toHaveAttribute('href', '/timelines')
    })
  })
})
