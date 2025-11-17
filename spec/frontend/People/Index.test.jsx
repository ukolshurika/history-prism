import { render, screen } from '@testing-library/react';
import { router } from '@inertiajs/react';
import Index from '../../../app/frontend/pages/People/Index';

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

describe('People Index', () => {
  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  };

  const mockPeople = [
    {
      id: 1,
      first_name: 'John',
      middle_name: 'Quincy',
      last_name: 'Adams',
      full_name: 'John Quincy Adams',
      events: [
        { id: 1, title: 'Birth' },
        { id: 2, title: 'Presidency' },
      ],
    },
    {
      id: 2,
      first_name: 'Marie',
      middle_name: null,
      last_name: 'Curie',
      full_name: 'Marie Curie',
      events: [
        { id: 3, title: 'Nobel Prize in Physics' },
      ],
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders people list page title', () => {
    render(
      <Index
        people={mockPeople}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('People')).toBeInTheDocument();
  });

  it('renders all people with their full names', () => {
    render(
      <Index
        people={mockPeople}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('John Quincy Adams')).toBeInTheDocument();
    expect(screen.getByText('Marie Curie')).toBeInTheDocument();
  });

  it('displays person details including first name', () => {
    render(
      <Index
        people={mockPeople}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText(/First Name: John/)).toBeInTheDocument();
    expect(screen.getByText(/First Name: Marie/)).toBeInTheDocument();
  });

  it('displays middle name when present', () => {
    render(
      <Index
        people={mockPeople}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText(/Middle Name: Quincy/)).toBeInTheDocument();
  });

  it('displays last name when present', () => {
    render(
      <Index
        people={mockPeople}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText(/Last Name: Adams/)).toBeInTheDocument();
    expect(screen.getByText(/Last Name: Curie/)).toBeInTheDocument();
  });

  it('displays event count for each person', () => {
    render(
      <Index
        people={mockPeople}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('2 events')).toBeInTheDocument();
    expect(screen.getByText('1 event')).toBeInTheDocument();
  });

  it('shows add person button when user is logged in', () => {
    render(
      <Index
        people={mockPeople}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const addButtons = screen.getAllByText('Add Person');
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it('shows add person link with correct href', () => {
    render(
      <Index
        people={mockPeople}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const addLinks = screen.getAllByRole('link', { name: /Add Person|Add new person|\+/ });
    addLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/people/new');
    });
  });

  it('does not show add button when user is not logged in', () => {
    render(
      <Index
        people={mockPeople}
        current_user={null}
        flash={{}}
      />
    );

    expect(screen.queryByText('Add Person')).not.toBeInTheDocument();
  });

  it('shows empty state when no people exist', () => {
    render(
      <Index
        people={[]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('No people yet.')).toBeInTheDocument();
  });

  it('shows add prompt in empty state for logged in users', () => {
    render(
      <Index
        people={[]}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Add the first person')).toBeInTheDocument();
  });

  it('does not show add prompt in empty state for logged out users', () => {
    render(
      <Index
        people={[]}
        current_user={null}
        flash={{}}
      />
    );

    expect(screen.queryByText('Add the first person')).not.toBeInTheDocument();
  });

  it('renders person links with correct href', () => {
    render(
      <Index
        people={mockPeople}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const personLinks = screen.getAllByRole('link').filter(link =>
      link.getAttribute('href')?.match(/^\/people\/\d+$/)
    );

    expect(personLinks.length).toBeGreaterThan(0);
  });

  it('renders within Layout component', () => {
    render(
      <Index
        people={mockPeople}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('displays multiple add person buttons for better UX', () => {
    render(
      <Index
        people={mockPeople}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    // Should have at least a button and a circular plus button
    const addLinks = screen.getAllByRole('link').filter(link =>
      link.getAttribute('href') === '/people/new'
    );

    expect(addLinks.length).toBeGreaterThan(1);
  });

  it('handles people with no events', () => {
    const peopleWithoutEvents = [
      {
        id: 3,
        first_name: 'Jane',
        last_name: 'Doe',
        full_name: 'Jane Doe',
        events: [],
      },
    ];

    render(
      <Index
        people={peopleWithoutEvents}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByText(/event/)).not.toBeInTheDocument();
  });

  it('does not display middle name when not present', () => {
    render(
      <Index
        people={mockPeople}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    // Marie Curie doesn't have a middle name
    const marieCard = screen.getByText('Marie Curie').closest('a');
    expect(marieCard).not.toHaveTextContent('Middle Name:');
  });
});
