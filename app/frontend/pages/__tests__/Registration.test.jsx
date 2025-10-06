import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { router } from '@inertiajs/react';
import Registration from '../Registration';

// Mock Inertia
jest.mock('@inertiajs/react', () => ({
  ...jest.requireActual('@inertiajs/react'),
  router: {
    post: jest.fn(),
  },
  Head: ({ title }) => <title>{title}</title>,
  useForm: jest.fn(),
}));

describe('Registration', () => {
  let mockPost;
  let mockSetData;
  let mockUseForm;

  beforeEach(() => {
    mockPost = jest.fn();
    mockSetData = jest.fn();
    mockUseForm = {
      data: {
        user: {
          email: '',
          password: '',
          password_confirmation: '',
        },
      },
      setData: mockSetData,
      post: mockPost,
      processing: false,
    };

    const { useForm } = require('@inertiajs/react');
    useForm.mockReturnValue(mockUseForm);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form', () => {
    render(<Registration errors={[]} />);

    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('displays error messages when errors prop is provided', () => {
    const errors = ['Email is invalid', 'Password is too short'];
    render(<Registration errors={errors} />);

    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    expect(screen.getByText('Password is too short')).toBeInTheDocument();
  });

  it('calls setData when email input changes', () => {
    render(<Registration errors={[]} />);

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(mockSetData).toHaveBeenCalledWith('user.email', 'test@example.com');
  });

  it('calls setData when password input changes', () => {
    render(<Registration errors={[]} />);

    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(mockSetData).toHaveBeenCalledWith('user.password', 'password123');
  });

  it('calls setData when password confirmation input changes', () => {
    render(<Registration errors={[]} />);

    const confirmInput = screen.getByLabelText('Confirm Password');
    fireEvent.change(confirmInput, { target: { value: 'password123' } });

    expect(mockSetData).toHaveBeenCalledWith('user.password_confirmation', 'password123');
  });

  it('submits form when Sign Up button is clicked', () => {
    render(<Registration errors={[]} />);

    const form = screen.getByRole('button', { name: /sign up/i }).closest('form');
    fireEvent.submit(form);

    expect(mockPost).toHaveBeenCalledWith('/registration');
  });

  it('disables submit button when processing', () => {
    mockUseForm.processing = true;
    const { useForm } = require('@inertiajs/react');
    useForm.mockReturnValue(mockUseForm);

    render(<Registration errors={[]} />);

    const submitButton = screen.getByRole('button', { name: /creating account/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows "Creating account..." text when processing', () => {
    mockUseForm.processing = true;
    const { useForm } = require('@inertiajs/react');
    useForm.mockReturnValue(mockUseForm);

    render(<Registration errors={[]} />);

    expect(screen.getByText('Creating account...')).toBeInTheDocument();
  });

  it('has required attribute on all input fields', () => {
    render(<Registration errors={[]} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm Password');

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmInput).toBeRequired();
  });

  it('has correct input types', () => {
    render(<Registration errors={[]} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm Password');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmInput).toHaveAttribute('type', 'password');
  });

  it('has correct name attributes for form fields', () => {
    render(<Registration errors={[]} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm Password');

    expect(emailInput).toHaveAttribute('name', 'user[email]');
    expect(passwordInput).toHaveAttribute('name', 'user[password]');
    expect(confirmInput).toHaveAttribute('name', 'user[password_confirmation]');
  });
});
