import { render, screen, fireEvent } from '@testing-library/react';
import Form from '../../../app/frontend/pages/People/Form';

// Mock Inertia
jest.mock('@inertiajs/react', () => ({
  ...jest.requireActual('@inertiajs/react'),
  router: {
    post: jest.fn(),
    put: jest.fn(),
  },
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ children, href, className, ...props }) => (
    <a href={href} className={className} {...props}>{children}</a>
  ),
  useForm: jest.fn(),
}));

// Mock Layout component
jest.mock('../../../app/frontend/pages/Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

describe('People Form', () => {
  let mockPost;
  let mockPut;
  let mockSetData;
  let mockUseForm;

  const mockEvents = [
    { id: 1, title: 'Birth', start_date: '1767-07-11' },
    { id: 2, title: 'Marriage', start_date: '1797-07-26' },
  ];

  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  };

  beforeEach(() => {
    mockPost = jest.fn();
    mockPut = jest.fn();
    mockSetData = jest.fn();
    mockUseForm = {
      data: {
        person: {
          first_name: '',
          middle_name: '',
          last_name: '',
          gedcom_uuid: '',
          event_ids: [],
        },
      },
      setData: mockSetData,
      post: mockPost,
      put: mockPut,
      processing: false,
    };

    const { useForm } = require('@inertiajs/react');
    useForm.mockReturnValue(mockUseForm);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('New Person Form', () => {
    it('renders create person form', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByText('Add New Person')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Person' })).toBeInTheDocument();
    });

    it('has all required form fields', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByLabelText(/First Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Middle Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/GEDCOM UUID/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Associated Events/)).toBeInTheDocument();
    });

    it('calls setData when first name input changes', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const firstNameInput = screen.getByLabelText(/First Name/);
      fireEvent.change(firstNameInput, { target: { value: 'John' } });

      expect(mockSetData).toHaveBeenCalledWith('person.first_name', 'John');
    });

    it('calls setData when middle name changes', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const middleNameInput = screen.getByLabelText(/Middle Name/);
      fireEvent.change(middleNameInput, { target: { value: 'Quincy' } });

      expect(mockSetData).toHaveBeenCalledWith('person.middle_name', 'Quincy');
    });

    it('calls setData when last name changes', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const lastNameInput = screen.getByLabelText(/Last Name/);
      fireEvent.change(lastNameInput, { target: { value: 'Adams' } });

      expect(mockSetData).toHaveBeenCalledWith('person.last_name', 'Adams');
    });

    it('calls setData when GEDCOM UUID changes', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const gedcomInput = screen.getByLabelText(/GEDCOM UUID/);
      fireEvent.change(gedcomInput, { target: { value: '@I1@' } });

      expect(mockSetData).toHaveBeenCalledWith('person.gedcom_uuid', '@I1@');
    });

    it('calls setData when events are selected', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const eventsSelect = screen.getByLabelText(/Associated Events/);

      // Create mock selectedOptions
      const mockSelectedOptions = [
        { value: '1' },
        { value: '2' },
      ];

      // Simulate selecting multiple options
      Object.defineProperty(eventsSelect, 'selectedOptions', {
        get: () => mockSelectedOptions,
        configurable: true,
      });

      fireEvent.change(eventsSelect);

      expect(mockSetData).toHaveBeenCalledWith('person.event_ids', [1, 2]);
    });

    it('calls post when form is submitted', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const form = screen.getByRole('button', { name: /add person/i }).closest('form');
      fireEvent.submit(form);

      expect(mockPost).toHaveBeenCalledWith('/people');
    });

    it('renders event options in select', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByText(/Birth \(7\/11\/1767\)/)).toBeInTheDocument();
      expect(screen.getByText(/Marriage \(7\/26\/1797\)/)).toBeInTheDocument();
    });

    it('shows message when no events are available', () => {
      render(
        <Form
          person={{}}
          events={[]}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByText('No person-type events available')).toBeInTheDocument();
    });

    it('first name is required', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByLabelText(/First Name/)).toBeRequired();
    });

    it('GEDCOM UUID is required', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByLabelText(/GEDCOM UUID/)).toBeRequired();
    });

    it('middle name is not required', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByLabelText(/Middle Name/)).not.toBeRequired();
    });

    it('last name is not required', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByLabelText(/Last Name/)).not.toBeRequired();
    });
  });

  describe('Edit Person Form', () => {
    const mockPerson = {
      id: 1,
      first_name: 'John',
      middle_name: 'Quincy',
      last_name: 'Adams',
      gedcom_uuid: '@I1@',
      event_ids: [1],
    };

    beforeEach(() => {
      mockUseForm.data.person = {
        first_name: mockPerson.first_name,
        middle_name: mockPerson.middle_name,
        last_name: mockPerson.last_name,
        gedcom_uuid: mockPerson.gedcom_uuid,
        event_ids: mockPerson.event_ids,
      };
      const { useForm } = require('@inertiajs/react');
      useForm.mockReturnValue(mockUseForm);
    });

    it('renders edit person form', () => {
      render(
        <Form
          person={mockPerson}
          events={mockEvents}
          isEdit={true}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByText('Edit Person')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Update Person' })).toBeInTheDocument();
    });

    it('calls put when edit form is submitted', () => {
      render(
        <Form
          person={mockPerson}
          events={mockEvents}
          isEdit={true}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const form = screen.getByRole('button', { name: /update person/i }).closest('form');
      fireEvent.submit(form);

      expect(mockPut).toHaveBeenCalledWith('/people/1');
    });
  });

  describe('Form validation and UX', () => {
    it('displays error messages when errors are provided', () => {
      const errors = ['First name is required', 'GEDCOM UUID must be unique'];

      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={errors}
        />
      );

      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('GEDCOM UUID must be unique')).toBeInTheDocument();
    });

    it('disables submit button when processing', () => {
      mockUseForm.processing = true;
      const { useForm } = require('@inertiajs/react');
      useForm.mockReturnValue(mockUseForm);

      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const submitButton = screen.getByRole('button', { name: /creating/i });
      expect(submitButton).toBeDisabled();
    });

    it('shows "Creating..." text when processing new person', () => {
      mockUseForm.processing = true;
      const { useForm } = require('@inertiajs/react');
      useForm.mockReturnValue(mockUseForm);

      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });

    it('shows "Updating..." text when processing edit', () => {
      mockUseForm.processing = true;
      const { useForm } = require('@inertiajs/react');
      useForm.mockReturnValue(mockUseForm);

      render(
        <Form
          person={{ id: 1 }}
          events={mockEvents}
          isEdit={true}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });

    it('has cancel link that goes back to people list', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const cancelLink = screen.getByText('Cancel');
      expect(cancelLink.closest('a')).toHaveAttribute('href', '/people');
    });

    it('has back to people link', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const backLink = screen.getByText('← Back to People');
      expect(backLink.closest('a')).toHaveAttribute('href', '/people');
    });

    it('renders within Layout component', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('has correct input types', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByLabelText(/First Name/)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/Middle Name/)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/Last Name/)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/GEDCOM UUID/)).toHaveAttribute('type', 'text');
    });

    it('GEDCOM UUID input has monospace font class', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const gedcomInput = screen.getByLabelText(/GEDCOM UUID/);
      expect(gedcomInput).toHaveClass('font-mono');
    });

    it('events select allows multiple selections', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const eventsSelect = screen.getByLabelText(/Associated Events/);
      expect(eventsSelect).toHaveAttribute('multiple');
    });

    it('shows helper text for GEDCOM UUID', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByText('Unique identifier for GEDCOM format')).toBeInTheDocument();
    });

    it('shows helper text for events selection', () => {
      render(
        <Form
          person={{}}
          events={mockEvents}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByText(/Hold Ctrl \(Windows\) or Cmd \(Mac\) to select multiple events/)).toBeInTheDocument();
    });
  });
});
