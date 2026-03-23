import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmEmail from '../ConfirmEmail'

const mockPost = jest.fn()
const mockSetData = jest.fn()

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  useForm: (initialData) => ({
    data: initialData,
    setData: mockSetData,
    post: mockPost,
    processing: false,
    errors: {},
  }),
}))

jest.mock('../Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

describe('ConfirmEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when email is provided and sent=false and resend=false', () => {
    it('shows "Проверьте почту" heading', () => {
      render(
        <ConfirmEmail
          current_user={null}
          flash={{}}
          email="test@test.com"
          sent={false}
          resend={false}
        />
      )
      expect(screen.getByRole('heading', { name: 'Проверьте почту' })).toBeInTheDocument()
    })

    it('shows the email address', () => {
      render(
        <ConfirmEmail
          current_user={null}
          flash={{}}
          email="test@test.com"
          sent={false}
          resend={false}
        />
      )
      expect(screen.getByText('test@test.com')).toBeInTheDocument()
    })

    it('has "Отправить повторно" link to /confirmation/new', () => {
      render(
        <ConfirmEmail
          current_user={null}
          flash={{}}
          email="test@test.com"
          sent={false}
          resend={false}
        />
      )
      const link = screen.getByText('Отправить повторно').closest('a')
      expect(link).toHaveAttribute('href', '/confirmation/new')
    })
  })

  describe('when sent=true', () => {
    it('shows "Письмо отправлено!" heading', () => {
      render(
        <ConfirmEmail
          current_user={null}
          flash={{}}
          email="test@test.com"
          sent={true}
          resend={false}
        />
      )
      expect(screen.getByRole('heading', { name: 'Письмо отправлено!' })).toBeInTheDocument()
    })
  })

  describe('when resend=true', () => {
    it('shows resend form with email input', () => {
      render(
        <ConfirmEmail
          current_user={null}
          flash={{}}
          email={null}
          sent={false}
          resend={true}
        />
      )
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it('shows resend form with submit button', () => {
      render(
        <ConfirmEmail
          current_user={null}
          flash={{}}
          email={null}
          sent={false}
          resend={true}
        />
      )
      expect(screen.getByRole('button', { name: /отправить письмо/i })).toBeInTheDocument()
    })
  })

  describe('when no email, sent, or resend props', () => {
    it('shows resend form', () => {
      render(
        <ConfirmEmail
          current_user={null}
          flash={{}}
        />
      )
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /отправить письмо/i })).toBeInTheDocument()
    })
  })

  describe('link to /session/new', () => {
    it('is present in check-inbox state', () => {
      render(
        <ConfirmEmail
          current_user={null}
          flash={{}}
          email="test@test.com"
          sent={false}
          resend={false}
        />
      )
      const link = screen.getByText('Вернуться к входу').closest('a')
      expect(link).toHaveAttribute('href', '/session/new')
    })

    it('is present in resend form state', () => {
      render(
        <ConfirmEmail
          current_user={null}
          flash={{}}
          resend={true}
        />
      )
      const link = screen.getByText('Вернуться к входу').closest('a')
      expect(link).toHaveAttribute('href', '/session/new')
    })
  })

  describe('form submission', () => {
    it('calls post("/confirmation") on submit', () => {
      render(
        <ConfirmEmail
          current_user={null}
          flash={{}}
          resend={true}
        />
      )
      fireEvent.submit(
        screen.getByRole('button', { name: /отправить письмо/i }).closest('form')
      )
      expect(mockPost).toHaveBeenCalledWith('/confirmation')
    })
  })

  it('wraps content in layout', () => {
    render(
      <ConfirmEmail
        current_user={null}
        flash={{}}
        email="test@test.com"
        sent={false}
        resend={false}
      />
    )
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })
})
