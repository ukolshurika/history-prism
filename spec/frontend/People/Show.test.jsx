import { render, screen, fireEvent } from '@testing-library/react';
import { router } from '@inertiajs/react';
import Show from '../../../app/frontend/pages/People/Show';

// Mock Inertia
jest.mock('@inertiajs/react', () => ({
  ...jest.requireActual('@inertiajs/react'),
  router: {
    delete: jest.fn(),
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

// Mock window.confirm
global.confirm = jest.fn();

describe('People Show', () => {
  const mockPerson = {
    id: 1,
    first_name: 'John',
    middle_name: 'Quincy',
    last_name: 'Adams',
    full_name: 'John Quincy Adams',
    gedcom_uuid: '@I1@',
    created_at: '2024-01-01T10:00:00.000Z',
    updated_at: '2024-01-02T15:30:00.000Z',
    events: [
      {
        id: 1,
        title: 'Birth',
        description: 'Born in Braintree, Massachusetts',
        start_date: '1767-07-11',
        end_date: '1767-07-11',
        category: 'person',
      },
      {
        id: 2,
        title: 'Presidency',
        description: 'Sixth President of the United States',
        start_date: '1825-03-04',
        end_date: '1829-03-04',
        category: 'achievement',
      },
    ],
  };

  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders person full name', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('John Quincy Adams')).toBeInTheDocument();
  });

  it('renders person first name', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('renders person middle name when present', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Middle Name')).toBeInTheDocument();
    expect(screen.getByText('Quincy')).toBeInTheDocument();
  });

  it('renders person last name when present', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Adams')).toBeInTheDocument();
  });

  it('does not render middle name section when not present', () => {
    const personWithoutMiddleName = {
      ...mockPerson,
      middle_name: null,
    };

    render(
      <Show
        person={personWithoutMiddleName}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.queryByText('Middle Name')).not.toBeInTheDocument();
  });

  it('does not render last name section when not present', () => {
    const personWithoutLastName = {
      ...mockPerson,
      last_name: null,
    };

    render(
      <Show
        person={personWithoutLastName}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.queryByText('Last Name')).not.toBeInTheDocument();
  });

  it('renders GEDCOM UUID', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('GEDCOM UUID')).toBeInTheDocument();
    expect(screen.getByText('@I1@')).toBeInTheDocument();
  });

  it('shows back to people link', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const backLink = screen.getByText('← Back to People');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/people');
  });

  it('shows edit button when user can edit', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('does not show edit button when user cannot edit', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('edit button has correct href', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const editLink = screen.getByText('Edit').closest('a');
    expect(editLink).toHaveAttribute('href', '/people/1/edit');
  });

  it('shows delete button when user can delete', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={true}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('does not show delete button when user cannot delete', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('shows confirmation dialog when delete button is clicked', () => {
    global.confirm.mockReturnValue(false);

    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={true}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this person?');
  });

  it('calls router.delete when delete is confirmed', () => {
    global.confirm.mockReturnValue(true);

    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={true}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(router.delete).toHaveBeenCalledWith('/people/1');
  });

  it('does not call router.delete when delete is cancelled', () => {
    global.confirm.mockReturnValue(false);

    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={true}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(router.delete).not.toHaveBeenCalled();
  });

  it('displays created at timestamp', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Created At')).toBeInTheDocument();
  });

  it('displays updated at timestamp when present', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Updated At')).toBeInTheDocument();
  });

  it('does not display updated at when not present', () => {
    const personWithoutUpdatedAt = {
      ...mockPerson,
      updated_at: null,
    };

    render(
      <Show
        person={personWithoutUpdatedAt}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.queryByText('Updated At')).not.toBeInTheDocument();
  });

  it('displays associated events section when events exist', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Associated Events')).toBeInTheDocument();
  });

  it('renders all associated events', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Birth')).toBeInTheDocument();
    expect(screen.getByText('Born in Braintree, Massachusetts')).toBeInTheDocument();
    expect(screen.getByText('Presidency')).toBeInTheDocument();
    expect(screen.getByText('Sixth President of the United States')).toBeInTheDocument();
  });

  it('displays event categories for associated events', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('person')).toBeInTheDocument();
    expect(screen.getByText('achievement')).toBeInTheDocument();
  });

  it('does not display associated events section when no events', () => {
    const personWithoutEvents = {
      ...mockPerson,
      events: [],
    };

    render(
      <Show
        person={personWithoutEvents}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.queryByText('Associated Events')).not.toBeInTheDocument();
  });

  it('event links have correct href', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const eventLinks = screen.getAllByRole('link').filter(link =>
      link.getAttribute('href')?.match(/^\/events\/\d+$/)
    );

    expect(eventLinks.length).toBe(2);
  });

  it('renders within Layout component', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('shows both edit and delete buttons when user has both permissions', () => {
    render(
      <Show
        person={mockPerson}
        can_edit={true}
        can_delete={true}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
