import { render, screen, fireEvent } from '@testing-library/react'
import Registration from '../Registration'

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
    data: {
      user: {
        email: '',
        password: '',
        password_confirmation: '',
      },
    },
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

describe('Registration', () => {
  const defaultProps = {
    current_user: null,
    flash: {},
    errors: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "Sign Up" heading', () => {
    render(<Registration {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('renders email input', () => {
    render(<Registration {...defaultProps} />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('renders password input', () => {
    render(<Registration {...defaultProps} />)
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })

  it('renders confirm password input', () => {
    render(<Registration {...defaultProps} />)
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('renders submit button with text "Sign Up"', () => {
    render(<Registration {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('shows errors when errors array is not empty', () => {
    render(
      <Registration
        {...defaultProps}
        errors={['Email is invalid', 'Password is too short']}
      />
    )
    expect(screen.getByText('Email is invalid')).toBeInTheDocument()
    expect(screen.getByText('Password is too short')).toBeInTheDocument()
  })

  it('does not show error block when errors is empty', () => {
    render(<Registration {...defaultProps} errors={[]} />)
    expect(screen.queryByText(/email is invalid/i)).not.toBeInTheDocument()
  })

  it('calls post("/registration") on form submit', () => {
    render(<Registration {...defaultProps} />)
    fireEvent.submit(screen.getByRole('button', { name: 'Sign Up' }).closest('form'))
    expect(mockPost).toHaveBeenCalledWith('/registration')
  })

  it('wraps content in layout', () => {
    render(<Registration {...defaultProps} />)
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })
})
