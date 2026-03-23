import { render, screen } from '@testing-library/react'
import Home from '../Home'

const mockPost = jest.fn()
const mockPut = jest.fn()
const mockDelete = jest.fn()
const mockGet = jest.fn()

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => <a href={href} className={className}>{children}</a>,
  useForm: () => ({
    data: {},
    setData: jest.fn(),
    post: mockPost,
    put: mockPut,
    processing: false,
    errors: {},
    reset: jest.fn(),
  }),
  usePage: () => ({ props: { yandex_maps_api_key: 'test-key' } }),
  router: { delete: mockDelete, get: mockGet, post: mockPost },
}))

jest.mock('../Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

describe('Home', () => {
  const mockCurrentUser = { id: 1, email: 'test@example.com' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "Welcome to History Prism!" heading', () => {
    render(<Home current_user={null} flash={{}} />)
    expect(screen.getByText('Welcome to History Prism!')).toBeInTheDocument()
  })

  it('shows logged-in message when current_user is present', () => {
    render(<Home current_user={mockCurrentUser} flash={{}} />)
    expect(screen.getByText(`You are logged in as ${mockCurrentUser.email}`)).toBeInTheDocument()
  })

  it('does NOT show the logged-in message when no current_user', () => {
    render(<Home current_user={null} flash={{}} />)
    expect(screen.queryByText(/You are logged in as/i)).not.toBeInTheDocument()
  })
})
