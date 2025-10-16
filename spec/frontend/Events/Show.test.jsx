import { render, screen, fireEvent } from '@testing-library/react';
import { router } from '@inertiajs/react';
import Show from '../../../app/frontend/pages/Events/Show';

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

describe('Events Show', () => {
  const mockEvent = {
    id: 1,
    title: 'Battle of Waterloo',
    description: 'A major battle that ended the Napoleonic Wars',
    start_date: '1815-06-18T00:00:00.000Z',
    end_date: '1815-06-18T23:59:59.000Z',
    category: 'war',
    creator: { email: 'historian@example.com' },
    created_at: '2024-01-01T10:00:00.000Z',
  };

  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders event title', () => {
    render(
      <Show
        event={mockEvent}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Battle of Waterloo')).toBeInTheDocument();
  });

  it('renders event description', () => {
    render(
      <Show
        event={mockEvent}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('A major battle that ended the Napoleonic Wars')).toBeInTheDocument();
  });

  it('renders event category', () => {
    render(
      <Show
        event={mockEvent}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('war')).toBeInTheDocument();
  });

  it('displays creator email', () => {
    render(
      <Show
        event={mockEvent}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('historian@example.com')).toBeInTheDocument();
  });

  it('shows back to events link', () => {
    render(
      <Show
        event={mockEvent}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const backLink = screen.getByText('← Back to Events');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/events');
  });

  it('shows edit button when user can edit', () => {
    render(
      <Show
        event={mockEvent}
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
        event={mockEvent}
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
        event={mockEvent}
        can_edit={true}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const editLink = screen.getByText('Edit').closest('a');
    expect(editLink).toHaveAttribute('href', '/events/1/edit');
  });

  it('shows delete button when user can delete', () => {
    render(
      <Show
        event={mockEvent}
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
        event={mockEvent}
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
        event={mockEvent}
        can_edit={false}
        can_delete={true}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this event?');
  });

  it('calls router.delete when delete is confirmed', () => {
    global.confirm.mockReturnValue(true);

    render(
      <Show
        event={mockEvent}
        can_edit={false}
        can_delete={true}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(router.delete).toHaveBeenCalledWith('/events/1');
  });

  it('does not call router.delete when delete is cancelled', () => {
    global.confirm.mockReturnValue(false);

    render(
      <Show
        event={mockEvent}
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

  it('displays start date label', () => {
    render(
      <Show
        event={mockEvent}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Start Date')).toBeInTheDocument();
  });

  it('displays end date label', () => {
    render(
      <Show
        event={mockEvent}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('End Date')).toBeInTheDocument();
  });

  it('displays description label', () => {
    render(
      <Show
        event={mockEvent}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('displays created by label', () => {
    render(
      <Show
        event={mockEvent}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Created By')).toBeInTheDocument();
  });

  it('displays created at label', () => {
    render(
      <Show
        event={mockEvent}
        can_edit={false}
        can_delete={false}
        current_user={mockCurrentUser}
        flash={{}}
      />
    );

    expect(screen.getByText('Created At')).toBeInTheDocument();
  });

  it('renders within Layout component', () => {
    render(
      <Show
        event={mockEvent}
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
        event={mockEvent}
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
