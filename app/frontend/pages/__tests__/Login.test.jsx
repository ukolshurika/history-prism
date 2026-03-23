import { render, screen, fireEvent } from '@testing-library/react'
import Login from '../Login'

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
    data: { email: '', password: '' },
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

describe('Login', () => {
  const defaultProps = {
    current_user: null,
    flash: {},
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "Sign In" heading', () => {
    render(<Login {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('renders email input', () => {
    render(<Login {...defaultProps} />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('renders password input', () => {
    render(<Login {...defaultProps} />)
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders submit button with text "Sign In"', () => {
    render(<Login {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('has link to /passwords/new with text "Забыли пароль?"', () => {
    render(<Login {...defaultProps} />)
    const link = screen.getByText('Забыли пароль?').closest('a')
    expect(link).toHaveAttribute('href', '/passwords/new')
  })

  it('has link to /registration/new with text "Sign up"', () => {
    render(<Login {...defaultProps} />)
    const link = screen.getByText('Sign up').closest('a')
    expect(link).toHaveAttribute('href', '/registration/new')
  })

  it('calls post("/session") on form submit', () => {
    render(<Login {...defaultProps} />)
    fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }).closest('form'))
    expect(mockPost).toHaveBeenCalledWith('/session')
  })

  it('wraps content in layout', () => {
    render(<Login {...defaultProps} />)
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })
})
