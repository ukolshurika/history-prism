import { render, screen, fireEvent } from '@testing-library/react';
import { router } from '@inertiajs/react';
import Layout from '../../app/frontend/pages/Layout';

// Mock Inertia router
jest.mock('@inertiajs/react', () => ({
  ...jest.requireActual('@inertiajs/react'),
  router: {
    delete: jest.fn(),
  },
  Link: ({ children, href, className, ...props }) => (
    <a href={href} className={className} {...props}>{children}</a>
  ),
}));

describe('Layout', () => {
  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Navigation bar', () => {
    it('renders the site title', () => {
      render(
        <Layout current_user={null} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByText('History Prism')).toBeInTheDocument();
    });

    it('renders Events link in navbar', () => {
      render(
        <Layout current_user={null} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      const eventsLink = screen.getByRole('link', { name: 'Events' });
      expect(eventsLink).toBeInTheDocument();
      expect(eventsLink).toHaveAttribute('href', '/events');
    });

    it('renders People link in navbar', () => {
      render(
        <Layout current_user={null} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      const peopleLink = screen.getByRole('link', { name: 'People' });
      expect(peopleLink).toBeInTheDocument();
      expect(peopleLink).toHaveAttribute('href', '/people');
    });

    it('renders GEDCOM Files link in navbar', () => {
      render(
        <Layout current_user={null} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      const gedcomLink = screen.getByRole('link', { name: 'GEDCOM Files' });
      expect(gedcomLink).toBeInTheDocument();
      expect(gedcomLink).toHaveAttribute('href', '/gedcom_files');
    });

    it('site title links to home page', () => {
      render(
        <Layout current_user={null} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      const titleLink = screen.getByText('History Prism').closest('a');
      expect(titleLink).toHaveAttribute('href', '/');
    });
  });

  describe('Authentication - signed in user', () => {
    it('displays user email when signed in', () => {
      render(
        <Layout current_user={mockCurrentUser} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('displays sign out button when signed in', () => {
      render(
        <Layout current_user={mockCurrentUser} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
    });

    it('calls router.delete when sign out button is clicked', () => {
      render(
        <Layout current_user={mockCurrentUser} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
      fireEvent.click(signOutButton);

      expect(router.delete).toHaveBeenCalledWith('/session');
    });

    it('does not display sign in link when signed in', () => {
      render(
        <Layout current_user={mockCurrentUser} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.queryByRole('link', { name: 'Sign In' })).not.toBeInTheDocument();
    });

    it('does not display sign up link when signed in', () => {
      render(
        <Layout current_user={mockCurrentUser} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.queryByRole('link', { name: 'Sign Up' })).not.toBeInTheDocument();
    });
  });

  describe('Authentication - not signed in', () => {
    it('displays sign in link when not signed in', () => {
      render(
        <Layout current_user={null} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      const signInLink = screen.getByRole('link', { name: 'Sign In' });
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute('href', '/session/new');
    });

    it('displays sign up link when not signed in', () => {
      render(
        <Layout current_user={null} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      const signUpLink = screen.getByRole('link', { name: 'Sign Up' });
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink).toHaveAttribute('href', '/registration/new');
    });

    it('does not display sign out button when not signed in', () => {
      render(
        <Layout current_user={null} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.queryByRole('button', { name: 'Sign Out' })).not.toBeInTheDocument();
    });

    it('does not display user email when not signed in', () => {
      render(
        <Layout current_user={null} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
    });
  });

  describe('Flash messages', () => {
    it('displays alert flash message', () => {
      render(
        <Layout current_user={null} flash={{ alert: 'This is an error' }}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByText('This is an error')).toBeInTheDocument();
    });

    it('displays notice flash message', () => {
      render(
        <Layout current_user={null} flash={{ notice: 'Success message' }}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('displays both alert and notice when both are present', () => {
      render(
        <Layout
          current_user={null}
          flash={{ alert: 'Error message', notice: 'Success message' }}
        >
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('does not display flash container when no messages', () => {
      const { container } = render(
        <Layout current_user={null} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      expect(container.querySelector('.bg-red-50')).not.toBeInTheDocument();
      expect(container.querySelector('.bg-green-50')).not.toBeInTheDocument();
    });
  });

  describe('Content rendering', () => {
    it('renders children content', () => {
      render(
        <Layout current_user={null} flash={{}}>
          <div data-testid="child-content">Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('wraps content in main tag', () => {
      const { container } = render(
        <Layout current_user={null} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main).toContainHTML('<div>Content</div>');
    });
  });

  describe('Styling', () => {
    it('has correct container styling', () => {
      const { container } = render(
        <Layout current_user={null} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      const rootDiv = container.firstChild;
      expect(rootDiv).toHaveClass('min-h-screen', 'bg-gray-50');
    });

    it('navbar has correct styling', () => {
      const { container } = render(
        <Layout current_user={null} flash={{}}>
          <div>Content</div>
        </Layout>
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-white', 'shadow-sm', 'border-b');
    });
  });
});
