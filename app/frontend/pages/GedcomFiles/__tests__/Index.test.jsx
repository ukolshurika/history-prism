import { render, screen, fireEvent } from '@testing-library/react'
import Index from '../Index'

const mockPost = jest.fn()
const mockPut = jest.fn()
const mockDelete = jest.fn()
const mockGet = jest.fn()

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, className }) => <a href={href} className={className}>{children}</a>,
  useForm: () => ({
    data: { file: null },
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

jest.mock('../../Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

describe('GedcomFiles Index', () => {
  const mockCurrentUser = { id: 1, email: 'test@example.com' }

  const mockGedcomFiles = [
    {
      id: 1,
      file_name: 'family.ged',
      file_url: '/rails/active_storage/blobs/xyz/family.ged',
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      file_name: 'ancestors.ged',
      file_url: null,
      created_at: '2024-02-20T10:00:00Z',
    },
  ]

  const defaultProps = {
    gedcom_files: [],
    current_user: null,
    flash: {},
    errors: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "GEDCOM Files" heading', () => {
    render(<Index {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'GEDCOM Files' })).toBeInTheDocument()
  })

  it('shows upload form with "Choose .ged file" label when current_user is present', () => {
    render(<Index {...defaultProps} current_user={mockCurrentUser} />)
    expect(screen.getByText('Choose .ged file')).toBeInTheDocument()
  })

  it('does not show upload form when no current_user', () => {
    render(<Index {...defaultProps} current_user={null} />)
    expect(screen.queryByText('Choose .ged file')).not.toBeInTheDocument()
  })

  it('Upload button is disabled when no file selected', () => {
    render(<Index {...defaultProps} current_user={mockCurrentUser} />)
    // data.file is null from the mock, so button is disabled
    const uploadButton = screen.getByRole('button', { name: /Upload/i })
    expect(uploadButton).toBeDisabled()
  })

  it('shows "No GEDCOM files uploaded yet." when gedcom_files is empty', () => {
    render(<Index {...defaultProps} />)
    expect(screen.getByText('No GEDCOM files uploaded yet.')).toBeInTheDocument()
  })

  it('renders file names when gedcom_files present', () => {
    render(<Index {...defaultProps} gedcom_files={mockGedcomFiles} />)
    expect(screen.getByText('family.ged')).toBeInTheDocument()
    expect(screen.getByText('ancestors.ged')).toBeInTheDocument()
  })

  it('renders Download link when file_url is present', () => {
    render(<Index {...defaultProps} gedcom_files={[mockGedcomFiles[0]]} />)
    const downloadLink = screen.getByText('Download').closest('a')
    expect(downloadLink).toHaveAttribute('href', mockGedcomFiles[0].file_url)
    expect(downloadLink).toHaveAttribute('download')
  })

  it('does not render Download link when file_url is absent', () => {
    render(<Index {...defaultProps} gedcom_files={[mockGedcomFiles[1]]} />)
    expect(screen.queryByText('Download')).not.toBeInTheDocument()
  })

  it('renders Reprocess button for each file', () => {
    render(<Index {...defaultProps} gedcom_files={mockGedcomFiles} />)
    const reprocessButtons = screen.getAllByRole('button', { name: /Reprocess/i })
    expect(reprocessButtons).toHaveLength(mockGedcomFiles.length)
  })

  it('shows errors when errors array is not empty', () => {
    const errors = ['File is not a valid GEDCOM file', 'File is too large']
    render(<Index {...defaultProps} current_user={mockCurrentUser} errors={errors} />)
    expect(screen.getByText('File is not a valid GEDCOM file')).toBeInTheDocument()
    expect(screen.getByText('File is too large')).toBeInTheDocument()
  })

  it('does not show errors section when errors is empty', () => {
    render(<Index {...defaultProps} current_user={mockCurrentUser} errors={[]} />)
    expect(screen.queryByText(/File is not a valid GEDCOM file/i)).not.toBeInTheDocument()
  })
})
