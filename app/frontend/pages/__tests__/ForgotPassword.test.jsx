import { render, screen, fireEvent } from '@testing-library/react'
import ForgotPassword from '../ForgotPassword'

const mockPost = jest.fn()
const mockSetData = jest.fn()

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  useForm: () => ({
    data: { email: '' },
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

describe('ForgotPassword', () => {
  const defaultProps = {
    current_user: null,
    flash: {},
    sent: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when sent=false', () => {
    it('renders "Восстановление пароля" heading', () => {
      render(<ForgotPassword {...defaultProps} />)
      expect(screen.getByRole('heading', { name: 'Восстановление пароля' })).toBeInTheDocument()
    })

    it('renders email input', () => {
      render(<ForgotPassword {...defaultProps} />)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it('renders submit button', () => {
      render(<ForgotPassword {...defaultProps} />)
      expect(screen.getByRole('button', { name: /отправить письмо/i })).toBeInTheDocument()
    })

    it('calls post("/passwords") on form submit', () => {
      render(<ForgotPassword {...defaultProps} />)
      fireEvent.submit(
        screen.getByRole('button', { name: /отправить письмо/i }).closest('form')
      )
      expect(mockPost).toHaveBeenCalledWith('/passwords')
    })
  })

  describe('when sent=true', () => {
    it('renders "Письмо отправлено!" heading', () => {
      render(<ForgotPassword {...defaultProps} sent={true} />)
      expect(screen.getByRole('heading', { name: 'Письмо отправлено!' })).toBeInTheDocument()
    })

    it('does not render a form', () => {
      render(<ForgotPassword {...defaultProps} sent={true} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('link to /session/new', () => {
    it('is present when sent=false', () => {
      render(<ForgotPassword {...defaultProps} sent={false} />)
      const link = screen.getByText('Вернуться к входу').closest('a')
      expect(link).toHaveAttribute('href', '/session/new')
    })

    it('is present when sent=true', () => {
      render(<ForgotPassword {...defaultProps} sent={true} />)
      const link = screen.getByText('Вернуться к входу').closest('a')
      expect(link).toHaveAttribute('href', '/session/new')
    })
  })

  it('wraps content in layout', () => {
    render(<ForgotPassword {...defaultProps} />)
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })
})
