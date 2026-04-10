import { render, screen, fireEvent } from '@testing-library/react'
import Form from '../Form'

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => <a href={href} className={className}>{children}</a>,
  usePage: () => ({ props: { yandex_maps_api_key: 'test-key' } }),
  router: {
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('../../../components/YandexMapPicker', () => {
  return function YandexMapPicker() {
    return <div data-testid="yandex-map-picker" />
  }
})

jest.mock('../../Layout', () => function Layout({ children }) {
  return <div data-testid="layout">{children}</div>
})

const { router } = require('@inertiajs/react')

describe('Books Form', () => {
  const mockCurrentUser = { id: 1, email: 'test@example.com' }

  const mockNewBook = {
    name: '',
    location: '',
    latitude: null,
    longitude: null,
  }

  const mockExistingBook = {
    id: 1,
    name: 'Family History',
    location: 'New York Library',
    latitude: 40.7128,
    longitude: -74.006,
    attachment_name: 'family.pdf',
    attachment_url: '/rails/active_storage/blobs/xyz/family.pdf',
    created_at: '2024-01-15T10:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Create Mode', () => {
    it('renders "Upload New Book" heading', () => {
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

    it('renders "Book Name" input field', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )
      expect(screen.getByLabelText('Book Name')).toBeInTheDocument()
    })

    it('renders "PDF File *" label and file input with id="attachment", accept=".pdf", required', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )
      // The label text includes "PDF File" with a * in a span
      expect(screen.getByText(/PDF File/)).toBeInTheDocument()
      const fileInput = document.getElementById('attachment')
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('accept', '.pdf')
      expect(fileInput).toHaveAttribute('required')
    })

    it('renders help text "Optional - defaults to the filename if not provided"', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )
      expect(screen.getByText('Optional - defaults to the filename if not provided')).toBeInTheDocument()
    })

    it('renders help text "Only PDF files are supported"', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )
      expect(screen.getByText('Only PDF files are supported')).toBeInTheDocument()
    })

    it('renders "Upload Book" submit button', () => {
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

    it('submit button is disabled when no file is attached (data.attachment is null initially)', () => {
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
  })

  describe('Edit Mode', () => {
    it('renders "Edit Book" heading', () => {
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

    it('renders "Save Changes" submit button', () => {
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

    it('shows current file section with book.attachment_name', () => {
      render(
        <Form
          book={mockExistingBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )
      expect(screen.getByText('family.pdf')).toBeInTheDocument()
    })

    it('shows "Uploaded on" date', () => {
      render(
        <Form
          book={mockExistingBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )
      expect(screen.getByText(/Uploaded on/i)).toBeInTheDocument()
    })

    it('shows Download link', () => {
      render(
        <Form
          book={mockExistingBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )
      const downloadLink = screen.getByText('Download').closest('a')
      expect(downloadLink).toHaveAttribute('href', mockExistingBook.attachment_url)
      expect(downloadLink).toHaveAttribute('download')
    })

    it('shows warning note about not being able to change PDF', () => {
      render(
        <Form
          book={mockExistingBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )
      expect(screen.getByText(/The PDF file cannot be changed after upload/i)).toBeInTheDocument()
    })

    it('does NOT show PDF file input in edit mode', () => {
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
      expect(document.getElementById('attachment')).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('renders "Back to Books" link to /books', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )
      const backLink = screen.getByRole('link', { name: /back to books/i })
      expect(backLink).toHaveAttribute('href', '/books')
    })

    it('renders Cancel link to /books', () => {
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
    it('shows errors list when errors array is not empty', () => {
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

    it('shows "There were N errors with your submission" header for multiple errors', () => {
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

    it('shows singular "There was 1 error with your submission" for a single error', () => {
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

    it('does not show errors section when errors array is empty', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )
      expect(screen.queryByText(/errors? with your submission/i)).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('calls router.post("/books", ...) on submit in create mode after selecting a file', () => {
      render(
        <Form
          book={mockNewBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={false}
        />
      )

      const fileInput = document.getElementById('attachment')
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      fireEvent.change(fileInput, { target: { files: [file] } })

      const form = document.querySelector('form')
      fireEvent.submit(form)

      expect(router.post).toHaveBeenCalledWith('/books', expect.any(FormData), expect.any(Object))
    })

    it('calls router.patch("/books/:id", ...) on submit in edit mode', () => {
      render(
        <Form
          book={mockExistingBook}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
          isEdit={true}
        />
      )

      const form = document.querySelector('form')
      fireEvent.submit(form)

      expect(router.patch).toHaveBeenCalledWith(
        `/books/${mockExistingBook.id}`,
        expect.any(FormData),
        expect.any(Object)
      )
    })
  })
})
