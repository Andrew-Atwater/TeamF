import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import Login from '../pages/Login';

// Mock Firebase auth with GoogleAuthProvider
jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    signInWithPopup: jest.fn(),
    GoogleAuthProvider: jest.fn().mockImplementation(() => ({
        providerId: 'google.com',
        addScope: jest.fn()
    }))
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn()
}));

// Mock Firebase config
jest.mock('../firebase-config', () => ({
    auth: {},
}));

const renderComponent = () => {
    render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );
};

describe('Login Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    test('renders login form with email and password fields', () => {
        renderComponent();
        expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    test('handles successful email/password login', async () => {
        renderComponent();
        const mockSignIn = signInWithEmailAndPassword as jest.Mock;
        mockSignIn.mockResolvedValueOnce({ user: { email: 'test@test.com' } });

        fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), {
            target: { value: 'test@test.com' }
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' }
        });
        
        const submitButton = screen.getByRole('button', { name: /^sign in$/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith(expect.anything(), 'test@test.com', 'password123');
        });
    });
    test('handles Google sign in', async () => {
        // Setup
        renderComponent();
        const mockGoogleSignIn = signInWithPopup as jest.Mock;
        const mockGoogleProvider = new GoogleAuthProvider();
        
        // Act
        const googleButton = screen.getByRole('button', { name: /sign in with google/i });
        fireEvent.click(googleButton);

        // Assert
        await waitFor(() => {
            expect(mockGoogleSignIn).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ providerId: 'google.com' })
            );
        });
    });

    test('shows loading state while signing in', async () => {
        renderComponent();
        const mockSignIn = signInWithEmailAndPassword as jest.Mock;
        mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        const submitButton = screen.getByRole('button', { name: /^sign in$/i });
        fireEvent.click(submitButton);
        
        expect(submitButton).toBeDisabled();
    });

    test('displays register link', () => {
        renderComponent();
        const registerLink = screen.getByRole('link', { name: /don't have an account\? register/i });
        expect(registerLink).toBeInTheDocument();
    });

    test('buttons are disabled while loading', async () => {
        renderComponent();
        const mockSignIn = signInWithEmailAndPassword as jest.Mock;
        mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        const submitButton = screen.getByRole('button', { name: /^sign in$/i });
        const googleButton = screen.getByRole('button', { name: /sign in with google/i });

        fireEvent.click(submitButton);

        expect(submitButton).toBeDisabled();
        expect(googleButton).toBeDisabled();
    });
});