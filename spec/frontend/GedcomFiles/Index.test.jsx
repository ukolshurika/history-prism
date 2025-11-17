import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { router } from '@inertiajs/react';
import Index from '../../../app/frontend/pages/GedcomFiles/Index';

// Mock Inertia
const mockPost = jest.fn();
const mockUseForm = jest.fn(() => ({
  data: { file: null },
  setData: jest.fn(),
  post: mockPost,
  processing: false,
  reset: jest.fn(),
}));

jest.mock('@inertiajs/react', () => ({
  ...jest.requireActual('@inertiajs/react'),
  router: {
    visit: jest.fn(),
  },
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ children, href, className, ...props }) => (
    <a href={href} className={className} {...props}>{children}</a>
  ),
  useForm: mockUseForm,
}));

// Mock Layout component
jest.mock('../../../app/frontend/pages/Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

describe('GedcomFiles Index', () => {
  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  };

  const mockGedcomFiles = [
    {
      id: 1,
      file_name: 'family_tree.ged',
      file_url: '/rails/active_storage/blobs/abc123/family_tree.ged',
      created_at: '2025-01-15T10:30:00Z',
      user_id: 1,
    },
    {
      id: 2,
      file_name: 'ancestors.ged',
      file_url: '/rails/active_storage/blobs/def456/ancestors.ged',
      created_at: '2025-02-20T14:45:00Z',
      user_id: 1,
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders GEDCOM files page title', () => {
    render(
      <Index
        gedcom_files={mockGedcomFiles}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('GEDCOM Files')).toBeInTheDocument();
  });

  it('renders all GEDCOM files with their names', () => {
    render(
      <Index
        gedcom_files={mockGedcomFiles}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('family_tree.ged')).toBeInTheDocument();
    expect(screen.getByText('ancestors.ged')).toBeInTheDocument();
  });

  it('displays upload date for each file', () => {
    render(
      <Index
        gedcom_files={mockGedcomFiles}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText(/Uploaded: 1\/15\/2025/)).toBeInTheDocument();
    expect(screen.getByText(/Uploaded: 2\/20\/2025/)).toBeInTheDocument();
  });

  it('shows upload form when user is logged in', () => {
    render(
      <Index
        gedcom_files={mockGedcomFiles}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Upload GEDCOM File')).toBeInTheDocument();
    expect(screen.getByText('Choose .ged file')).toBeInTheDocument();
  });

  it('does not show upload form when user is not logged in', () => {
    render(
      <Index
        gedcom_files={mockGedcomFiles}
        current_user={null}
        flash={{}}
      />
    );

    expect(screen.queryByText('Upload GEDCOM File')).not.toBeInTheDocument();
  });

  it('shows empty state when no files exist', () => {
    render(
      <Index
        gedcom_files={[]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('No GEDCOM files uploaded yet.')).toBeInTheDocument();
  });

  it('shows helper text in empty state for logged in users', () => {
    render(
      <Index
        gedcom_files={[]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText(/Upload your first GEDCOM file above/)).toBeInTheDocument();
  });

  it('renders download links for each file', () => {
    render(
      <Index
        gedcom_files={mockGedcomFiles}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const downloadLinks = screen.getAllByText('Download');
    expect(downloadLinks).toHaveLength(2);
    expect(downloadLinks[0]).toHaveAttribute('href', mockGedcomFiles[0].file_url);
    expect(downloadLinks[1]).toHaveAttribute('href', mockGedcomFiles[1].file_url);
  });

  it('file input accepts only .ged files', () => {
    render(
      <Index
        gedcom_files={mockGedcomFiles}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const fileInput = screen.getByLabelText('Choose .ged file').querySelector('input');
    expect(fileInput).toHaveAttribute('accept', '.ged');
  });

  it('displays error messages when present', () => {
    const errors = ['File must be a .ged file', 'File is too large'];
    render(
      <Index
        gedcom_files={mockGedcomFiles}
        current_user={mockCurrentUser}
        flash={{}}
        errors={errors}
      />
    );

    expect(screen.getByText('File must be a .ged file')).toBeInTheDocument();
    expect(screen.getByText('File is too large')).toBeInTheDocument();
  });

  it('renders within Layout component', () => {
    render(
      <Index
        gedcom_files={mockGedcomFiles}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('displays upload button', () => {
    render(
      <Index
        gedcom_files={mockGedcomFiles}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
  });

  it('handles files with no download URL', () => {
    const filesWithoutUrl = [
      {
        id: 3,
        file_name: 'test.ged',
        file_url: null,
        created_at: '2025-03-01T10:00:00Z',
        user_id: 1,
      },
    ];

    render(
      <Index
        gedcom_files={filesWithoutUrl}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('test.ged')).toBeInTheDocument();
    expect(screen.queryByText('Download')).not.toBeInTheDocument();
  });

  it('disables upload button when no file selected', () => {
    render(
      <Index
        gedcom_files={mockGedcomFiles}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const uploadButton = screen.getByRole('button', { name: 'Upload' });
    expect(uploadButton).toBeDisabled();
  });

  it('displays file cards in grid layout', () => {
    const { container } = render(
      <Index
        gedcom_files={mockGedcomFiles}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3');
  });
});
