import { render, screen, fireEvent } from '@testing-library/react';
import Form from '../../../app/frontend/pages/Events/Form';

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

describe('Events Form', () => {
  let mockPost;
  let mockPut;
  let mockSetData;
  let mockUseForm;

  const mockCategories = ['person', 'place', 'war', 'achievement', 'disaster'];

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
        event: {
          title: '',
          description: '',
          start_date: '',
          end_date: '',
          category: 'person',
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

  describe('New Event Form', () => {
    it('renders create event form', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByText('Create New Event')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Event' })).toBeInTheDocument();
    });

    it('has all required form fields', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    });

    it('renders all category options', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      mockCategories.forEach(category => {
        const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
        expect(screen.getByText(capitalizedCategory)).toBeInTheDocument();
      });
    });

    it('calls setData when title input changes', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const titleInput = screen.getByLabelText('Title');
      fireEvent.change(titleInput, { target: { value: 'New Event Title' } });

      expect(mockSetData).toHaveBeenCalledWith('event.title', 'New Event Title');
    });

    it('calls setData when description changes', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const descriptionInput = screen.getByLabelText('Description');
      fireEvent.change(descriptionInput, { target: { value: 'Event description' } });

      expect(mockSetData).toHaveBeenCalledWith('event.description', 'Event description');
    });

    it('calls setData when category changes', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const categorySelect = screen.getByLabelText('Category');
      fireEvent.change(categorySelect, { target: { value: 'war' } });

      expect(mockSetData).toHaveBeenCalledWith('event.category', 'war');
    });

    it('calls setData when start date changes', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const startDateInput = screen.getByLabelText('Start Date');
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

      expect(mockSetData).toHaveBeenCalledWith('event.start_date', '2024-01-01');
    });

    it('calls setData when end date changes', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const endDateInput = screen.getByLabelText('End Date');
      fireEvent.change(endDateInput, { target: { value: '2024-01-02' } });

      expect(mockSetData).toHaveBeenCalledWith('event.end_date', '2024-01-02');
    });

    it('calls post when form is submitted', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const form = screen.getByRole('button', { name: /create event/i }).closest('form');
      fireEvent.submit(form);

      expect(mockPost).toHaveBeenCalledWith('/events');
    });

    it('date inputs use date type (not datetime-local)', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const startDateInput = screen.getByLabelText('Start Date');
      const endDateInput = screen.getByLabelText('End Date');

      expect(startDateInput).toHaveAttribute('type', 'date');
      expect(endDateInput).toHaveAttribute('type', 'date');
    });
  });

  describe('Edit Event Form', () => {
    const mockEvent = {
      id: 1,
      title: 'Battle of Waterloo',
      description: 'A major battle',
      start_date: '1815-06-18',
      end_date: '1815-06-18',
      category: 'war',
    };

    beforeEach(() => {
      mockUseForm.data.event = {
        title: mockEvent.title,
        description: mockEvent.description,
        start_date: mockEvent.start_date,
        end_date: mockEvent.end_date,
        category: mockEvent.category,
      };
      const { useForm } = require('@inertiajs/react');
      useForm.mockReturnValue(mockUseForm);
    });

    it('renders edit event form', () => {
      render(
        <Form
          event={mockEvent}
          categories={mockCategories}
          isEdit={true}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByText('Edit Event')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Update Event' })).toBeInTheDocument();
    });

    it('calls put when edit form is submitted', () => {
      render(
        <Form
          event={mockEvent}
          categories={mockCategories}
          isEdit={true}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const form = screen.getByRole('button', { name: /update event/i }).closest('form');
      fireEvent.submit(form);

      expect(mockPut).toHaveBeenCalledWith('/events/1');
    });
  });

  describe('Form validation and UX', () => {
    it('displays error messages when errors are provided', () => {
      const errors = ['Title is required', 'Start date must be before end date'];

      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={errors}
        />
      );

      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Start date must be before end date')).toBeInTheDocument();
    });

    it('all required fields have required attribute', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByLabelText('Title')).toBeRequired();
      expect(screen.getByLabelText('Description')).toBeRequired();
      expect(screen.getByLabelText('Category')).toBeRequired();
      expect(screen.getByLabelText('Start Date')).toBeRequired();
      expect(screen.getByLabelText('End Date')).toBeRequired();
    });

    it('disables submit button when processing', () => {
      mockUseForm.processing = true;
      const { useForm } = require('@inertiajs/react');
      useForm.mockReturnValue(mockUseForm);

      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const submitButton = screen.getByRole('button', { name: /creating/i });
      expect(submitButton).toBeDisabled();
    });

    it('shows "Creating..." text when processing new event', () => {
      mockUseForm.processing = true;
      const { useForm } = require('@inertiajs/react');
      useForm.mockReturnValue(mockUseForm);

      render(
        <Form
          event={{}}
          categories={mockCategories}
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
          event={{ id: 1 }}
          categories={mockCategories}
          isEdit={true}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });

    it('has cancel link that goes back to events list', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const cancelLink = screen.getByText('Cancel');
      expect(cancelLink.closest('a')).toHaveAttribute('href', '/events');
    });

    it('has back to events link', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const backLink = screen.getByText('← Back to Events');
      expect(backLink.closest('a')).toHaveAttribute('href', '/events');
    });

    it('renders within Layout component', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
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
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      expect(screen.getByLabelText('Title')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Start Date')).toHaveAttribute('type', 'date');
      expect(screen.getByLabelText('End Date')).toHaveAttribute('type', 'date');
    });

    it('description is a textarea', () => {
      render(
        <Form
          event={{}}
          categories={mockCategories}
          isEdit={false}
          current_user={mockCurrentUser}
          flash={{}}
          errors={[]}
        />
      );

      const descriptionField = screen.getByLabelText('Description');
      expect(descriptionField.tagName).toBe('TEXTAREA');
    });
  });
});
