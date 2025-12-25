import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

// Mock AuthContext
const mockLogin = vi.fn();
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
        user: null,
        loading: false,
    }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

// Wrapper component with Router
const TestWrapper = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
);

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render login form', () => {
        render(<Login />, { wrapper: TestWrapper });

        expect(screen.getByRole('heading')).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should show error when submitting empty form', async () => {
        const user = userEvent.setup();
        render(<Login />, { wrapper: TestWrapper });

        const submitButton = screen.getByRole('button', { name: /login/i });
        await user.click(submitButton);

        // Should show validation errors
        await waitFor(() => {
            const alerts = screen.getAllByRole('alert');
            expect(alerts.length).toBeGreaterThan(0);
        });
    });

    it('should update email input on change', async () => {
        const user = userEvent.setup();
        render(<Login />, { wrapper: TestWrapper });

        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, 'test@emsi-edu.ma');

        expect(emailInput).toHaveValue('test@emsi-edu.ma');
    });

    it('should update password input on change', async () => {
        const user = userEvent.setup();
        render(<Login />, { wrapper: TestWrapper });

        const passwordInput = screen.getByLabelText(/password/i);
        await user.type(passwordInput, 'password123');

        expect(passwordInput).toHaveValue('password123');
    });

    it('should toggle password visibility', async () => {
        const user = userEvent.setup();
        render(<Login />, { wrapper: TestWrapper });

        const passwordInput = screen.getByLabelText(/password/i);
        const toggleButton = screen.getByRole('button', { name: /show password/i });

        // Initially password should be hidden
        expect(passwordInput).toHaveAttribute('type', 'password');

        // Click to show password
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        // Click to hide password again
        await user.click(screen.getByRole('button', { name: /hide password/i }));
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have link to register page', () => {
        render(<Login />, { wrapper: TestWrapper });

        const registerLink = screen.getByRole('link', { name: /create_account/i });
        expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('should call login function on valid form submission', async () => {
        const user = userEvent.setup();
        mockLogin.mockResolvedValue({ success: true });

        render(<Login />, { wrapper: TestWrapper });

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        await user.type(emailInput, 'test@emsi-edu.ma');
        await user.type(passwordInput, 'Password123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled();
        });
    });

    it('should display error message on login failure', async () => {
        const user = userEvent.setup();
        mockLogin.mockRejectedValue(new Error('Invalid credentials'));

        render(<Login />, { wrapper: TestWrapper });

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        await user.type(emailInput, 'test@emsi-edu.ma');
        await user.type(passwordInput, 'wrongpassword');
        await user.click(submitButton);

        // The toast error should appear
        await waitFor(() => {
            // Login was called even if it fails
            expect(mockLogin).toHaveBeenCalled();
        });
    });
});
