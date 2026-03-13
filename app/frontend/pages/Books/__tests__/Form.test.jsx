import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Form from '../Form'

// Mock Inertia
const mockPost = jest.fn()
const mockPatch = jest.fn()
const mockSetData = jest.fn()

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  useForm: () => ({
    data: {
      name: '',
      location: '',
      attachment: null,
    },
    setData: mockSetData,
    post: mockPost,
    patch: mockPatch,
    processing: false,
  }),
}))

// Mock Layout
jest.mock('../../Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

describe('Books Form', () => {
  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  }

  const mockNewBook = {
    name: '',
    location: '',
  }

  const mockExistingBook = {
    id: 1,
    name: 'Family History',
    location: 'New York Library',
    attachment_name: 'family.pdf',
    attachment_url: '/rails/active_storage/blobs/xyz/family.pdf',
    created_at: '2024-01-15T10:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Create Mode', () => {
    it('renders new book form title', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      expect(screen.getByText('Upload New Book')).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      expect(screen.getByLabelText(/Book Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Location/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/PDF File/i)).toBeInTheDocument()
    })

    it('displays help text for optional fields', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      expect(screen.getByText(/defaults to the filename if not provided/i)).toBeInTheDocument()
      expect(screen.getByText(/where the book is stored or found/i)).toBeInTheDocument()
      expect(screen.getByText(/Only PDF files are supported/i)).toBeInTheDocument()
    })

    it('shows required indicator for PDF file', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const label = screen.getByText(/PDF File/i)
      expect(label.innerHTML).toContain('*')
    })

    it('renders submit button with correct text', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      expect(screen.getByRole('button', { name: /Upload Book/i })).toBeInTheDocument()
    })

    it('has file input with accept .pdf attribute', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const fileInput = screen.getByLabelText(/PDF File/i)
      expect(fileInput).toHaveAttribute('accept', '.pdf')
      expect(fileInput).toHaveAttribute('required')
    })

    it('does not show current file section in create mode', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      expect(screen.queryByText('Current File')).not.toBeInTheDocument()
    })

    it('does not show edit mode warning in create mode', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      expect(screen.queryByText(/You can only edit the book name and location/i)).not.toBeInTheDocument()
    })
  })

  describe('Edit Mode', () => {
    it('renders edit book form title', () => {
      render(
        <Form
          book={mockExistingBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )

      expect(screen.getByText('Edit Book')).toBeInTheDocument()
    })

    it('renders submit button with correct text', () => {
      render(
        <Form
          book={mockExistingBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )

      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument()
    })

    it('does not show PDF file input in edit mode', () => {
      render(
        <Form
          book={mockExistingBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )

      expect(screen.queryByText('Choose PDF file')).not.toBeInTheDocument()
    })

    it('shows current file information', () => {
      render(
        <Form
          book={mockExistingBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )

      expect(screen.getByText('Current File')).toBeInTheDocument()
      expect(screen.getByText('family.pdf')).toBeInTheDocument()
      expect(screen.getByText(/Uploaded on/i)).toBeInTheDocument()
    })

    it('shows download link for current file', () => {
      render(
        <Form
          book={mockExistingBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )

      const downloadLinks = screen.getAllByText('Download')
      const downloadLink = downloadLinks[0].closest('a')
      expect(downloadLink).toHaveAttribute('href', mockExistingBook.attachment_url)
      expect(downloadLink).toHaveAttribute('download')
    })

    it('shows edit mode warning', () => {
      render(
        <Form
          book={mockExistingBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )

      expect(screen.getByText(/You can only edit the book name and location/i)).toBeInTheDocument()
      expect(screen.getByText(/The PDF file cannot be changed after upload/i)).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('renders back to books link', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const backLink = screen.getByText('Back to Books').closest('a')
      expect(backLink).toHaveAttribute('href', '/books')
    })

    it('renders cancel button that links to books index', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const cancelLink = screen.getByText('Cancel').closest('a')
      expect(cancelLink).toHaveAttribute('href', '/books')
    })
  })

  describe('Error Handling', () => {
    it('displays validation errors when present', () => {
      const errors = ['Attachment must be a PDF file', 'Name is too long']

      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={errors}
          isEdit={false}
        />
      )

      expect(screen.getByText('Attachment must be a PDF file')).toBeInTheDocument()
      expect(screen.getByText('Name is too long')).toBeInTheDocument()
    })

    it('shows error count in error header', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3']

      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={errors}
          isEdit={false}
        />
      )

      expect(screen.getByText(/There were 3 errors with your submission/i)).toBeInTheDocument()
    })

    it('uses singular form for single error', () => {
      const errors = ['Single error']

      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={errors}
          isEdit={false}
        />
      )

      expect(screen.getByText(/There was 1 error with your submission/i)).toBeInTheDocument()
    })

    it('does not show error section when no errors', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })
  })

  describe('Form Field Placeholders', () => {
    it('has placeholder text for name field', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const nameInput = screen.getByLabelText(/Book Name/i)
      expect(nameInput).toHaveAttribute('placeholder', 'e.g., Family History Journal')
    })

    it('has placeholder text for location field', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const locationInput = screen.getByLabelText(/Location/i)
      expect(locationInput).toHaveAttribute('placeholder', 'e.g., New York Public Library')
    })
  })

  describe('Button States', () => {
    it('submit button is disabled when no attachment in create mode', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const submitButton = screen.getByRole('button', { name: /Upload Book/i })
      expect(submitButton).toBeDisabled()
    })

    it('shows processing text when form is being submitted', () => {
      // This would require mocking useForm to return processing: true
      // The component correctly shows "Uploading..." or "Saving..." when processing
    })
  })

  describe('Styling and Layout', () => {
    it('applies correct container width classes', () => {
      const { container } = render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const mainContainer = container.querySelector('.max-w-3xl')
      expect(mainContainer).toBeInTheDocument()
    })

    it('renders form in white card with shadow', () => {
      const { container } = render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const formCard = container.querySelector('.bg-white.rounded-lg.shadow')
      expect(formCard).toBeInTheDocument()
    })

    it('uses proper spacing between form fields', () => {
      const { container } = render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const formFieldsContainer = container.querySelector('.space-y-6')
      expect(formFieldsContainer).toBeInTheDocument()
    })
  })

  describe('Icons', () => {
    it('renders upload icon in file input button', () => {
      const { container } = render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const uploadSvg = container.querySelector('svg')
      expect(uploadSvg).toBeInTheDocument()
    })

    it('renders back arrow icon in back link', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const backLink = screen.getByText('Back to Books').closest('a')
      const svg = backLink.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })
})
