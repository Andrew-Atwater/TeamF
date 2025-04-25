import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import Register from '../pages/Register';

// Mock Firebase auth hooks with controlled mock functions
const mockCreateUser = jest.fn();
const mockGoogleSignIn = jest.fn();
jest.mock('react-firebase-hooks/auth', () => ({
    useCreateUserWithEmailAndPassword: () => [mockCreateUser, null, false, null],
    useSignInWithGoogle: () => [mockGoogleSignIn, null, false, null]
}));

// Mock Firebase Firestore
const mockAddDoc = jest.fn().mockResolvedValue({});
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    addDoc: jest.fn(() => mockAddDoc())
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

// Mock Firebase config
jest.mock('../firebase-config', () => ({
    auth: {},
    db: {}
}));

const renderComponent = () => {
    render(
        <BrowserRouter>
            <Register />
        </BrowserRouter>
    );
};

describe('Register Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders register form with all fields', () => {
        renderComponent();
        expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    });

    test('handles successful email/password registration', async () => {
        mockCreateUser.mockResolvedValueOnce({
            user: { uid: '123', email: 'test@test.com' }
        });

        renderComponent();

        fireEvent.change(screen.getByRole('textbox', { name: /name/i }), {
            target: { value: 'Test User' }
        });
        fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), {
            target: { value: 'test@test.com' }
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' }
        });

        const registerButton = screen.getByRole('button', { name: /^register$/i });
        fireEvent.click(registerButton);

        await waitFor(() => {
            expect(mockCreateUser).toHaveBeenCalledWith('test@test.com', 'password123');
        });
    });

    test('handles Google registration', async () => {
        mockGoogleSignIn.mockResolvedValueOnce({
            user: { uid: '123', email: 'test@gmail.com' }
        });

        renderComponent();

        const googleButton = screen.getByRole('button', { name: /register with google/i });
        fireEvent.click(googleButton);

        await waitFor(() => {
            expect(mockGoogleSignIn).toHaveBeenCalled();
        });
    });

    test('shows validation error when fields are empty', async () => {
        renderComponent();
        const registerButton = screen.getByRole('button', { name: /^register$/i });
        fireEvent.click(registerButton);

        await waitFor(() => {
            expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
        });
    });

    test('displays login link', () => {
        renderComponent();
        const loginLink = screen.getByRole('link', { name: /already have an account\? login/i });
        expect(loginLink).toBeInTheDocument();
    });

    test('handles registration errors', async () => {
        mockCreateUser.mockRejectedValueOnce(
            new FirebaseError('auth/email-already-in-use', 'Email already in use')
        );

        renderComponent();

        fireEvent.change(screen.getByRole('textbox', { name: /name/i }), {
            target: { value: 'Test User' }
        });
        fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), {
            target: { value: 'existing@test.com' }
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' }
        });

        const registerButton = screen.getByRole('button', { name: /^register$/i });
        fireEvent.click(registerButton);

        // Wait for error dialog or message
        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(/email already in use/i);
        });
    });
});