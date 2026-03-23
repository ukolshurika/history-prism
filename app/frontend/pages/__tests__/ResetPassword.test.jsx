import { render, screen, fireEvent } from '@testing-library/react'
import ResetPassword from '../ResetPassword'

const mockPut = jest.fn()
const mockSetData = jest.fn()

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  useForm: () => ({
    data: { password: '', password_confirmation: '' },
    setData: mockSetData,
    put: mockPut,
    processing: false,
    errors: {},
  }),
}))

jest.mock('../Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

describe('ResetPassword', () => {
  const defaultProps = {
    current_user: null,
    flash: {},
    token: 'abc123token',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "Новый пароль" heading', () => {
    render(<ResetPassword {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'Новый пароль' })).toBeInTheDocument()
  })

  it('renders password input', () => {
    render(<ResetPassword {...defaultProps} />)
    expect(screen.getByLabelText(/новый пароль/i)).toBeInTheDocument()
  })

  it('renders password_confirmation input', () => {
    render(<ResetPassword {...defaultProps} />)
    expect(screen.getByLabelText(/подтвердите пароль/i)).toBeInTheDocument()
  })

  it('renders submit button "Сохранить пароль"', () => {
    render(<ResetPassword {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Сохранить пароль' })).toBeInTheDocument()
  })

  it('has link to /session/new', () => {
    render(<ResetPassword {...defaultProps} />)
    const link = screen.getByText('Вернуться к входу').closest('a')
    expect(link).toHaveAttribute('href', '/session/new')
  })

  it('calls put with the token URL on form submit', () => {
    render(<ResetPassword {...defaultProps} token="abc123token" />)
    fireEvent.submit(
      screen.getByRole('button', { name: 'Сохранить пароль' }).closest('form')
    )
    expect(mockPut).toHaveBeenCalledWith('/passwords/abc123token')
  })

  it('wraps content in layout', () => {
    render(<ResetPassword {...defaultProps} />)
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })
})
