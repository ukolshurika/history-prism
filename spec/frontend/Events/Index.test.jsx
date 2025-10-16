import { render, screen } from '@testing-library/react';
import { router } from '@inertiajs/react';
import Index from '../../../app/frontend/pages/Events/Index';

// Mock Inertia
jest.mock('@inertiajs/react', () => ({
  ...jest.requireActual('@inertiajs/react'),
  router: {
    visit: jest.fn(),
  },
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ children, href, className, ...props }) => (
    <a href={href} className={className} {...props}>{children}</a>
  ),
}));

// Mock Layout component
jest.mock('../../../app/frontend/pages/Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

describe('Events Index', () => {
  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  };

  const mockEvents = [
    {
      id: 1,
      title: 'Battle of Waterloo',
      description: 'A major battle in European history',
      start_date: '1815-06-18',
      end_date: '1815-06-18',
      category: 'war',
      creator: { email: 'test@example.com' },
    },
    {
      id: 2,
      title: 'Moon Landing',
      description: 'First humans on the moon',
      start_date: '1969-07-20',
      end_date: '1969-07-20',
      category: 'achievement',
      creator: { email: 'another@example.com' },
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders events list page title', () => {
    render(
      <Index
        events={mockEvents}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  it('renders all events with their details', () => {
    render(
      <Index
        events={mockEvents}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Battle of Waterloo')).toBeInTheDocument();
    expect(screen.getByText('A major battle in European history')).toBeInTheDocument();
    expect(screen.getByText('Moon Landing')).toBeInTheDocument();
    expect(screen.getByText('First humans on the moon')).toBeInTheDocument();
  });

  it('displays event categories', () => {
    render(
      <Index
        events={mockEvents}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('war')).toBeInTheDocument();
    expect(screen.getByText('achievement')).toBeInTheDocument();
  });

  it('displays event dates in readable format', () => {
    render(
      <Index
        events={mockEvents}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    // Check for "Start:" and "End:" labels
    const startLabels = screen.getAllByText(/Start:/);
    const endLabels = screen.getAllByText(/End:/);

    expect(startLabels.length).toBeGreaterThan(0);
    expect(endLabels.length).toBeGreaterThan(0);
  });

  it('displays event creator email', () => {
    render(
      <Index
        events={mockEvents}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/another@example.com/)).toBeInTheDocument();
  });

  it('shows create event button when user is logged in', () => {
    render(
      <Index
        events={mockEvents}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const createButtons = screen.getAllByText('Create Event');
    expect(createButtons.length).toBeGreaterThan(0);
  });

  it('shows create event link with correct href', () => {
    render(
      <Index
        events={mockEvents}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const createLinks = screen.getAllByRole('link', { name: /Create Event|\\+/ });
    createLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/events/new');
    });
  });

  it('does not show create button when user is not logged in', () => {
    render(
      <Index
        events={mockEvents}
        current_user={null}
        flash={{}}
      />
    );

    expect(screen.queryByText('Create Event')).not.toBeInTheDocument();
  });

  it('shows empty state when no events exist', () => {
    render(
      <Index
        events={[]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('No events yet.')).toBeInTheDocument();
  });

  it('shows create prompt in empty state for logged in users', () => {
    render(
      <Index
        events={[]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Create the first event')).toBeInTheDocument();
  });

  it('does not show create prompt in empty state for logged out users', () => {
    render(
      <Index
        events={[]}
        current_user={null}
        flash={{}}
      />
    );

    expect(screen.queryByText('Create the first event')).not.toBeInTheDocument();
  });

  it('renders event links with correct href', () => {
    render(
      <Index
        events={mockEvents}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const eventLinks = screen.getAllByRole('link').filter(link =>
      link.getAttribute('href')?.includes('/events/')
    );

    expect(eventLinks.length).toBeGreaterThan(0);
  });

  it('renders within Layout component', () => {
    render(
      <Index
        events={mockEvents}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('displays multiple create event buttons for better UX', () => {
    render(
      <Index
        events={mockEvents}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    // Should have at least a button and a circular plus button
    const createLinks = screen.getAllByRole('link').filter(link =>
      link.getAttribute('href') === '/events/new'
    );

    expect(createLinks.length).toBeGreaterThan(1);
  });
});
