import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import App from '../App';

// Mock all required components
jest.mock('../pages/Home', () => () => <div>Home Page</div>);
jest.mock('../pages/Login', () => () => <div>Login Page</div>);
jest.mock('../pages/Register', () => () => <div>Register Page</div>);
jest.mock('../pages/Settings', () => () => <div>Settings Page</div>);
jest.mock('../pages/TransactionHistory', () => () => <div>Transaction History Page</div>);
jest.mock('../pages/AddTransaction', () => () => <div>Add Transaction Page</div>);
jest.mock('../pages/CostCalculator', () => () => <div>Cost Calculator Page</div>);
jest.mock('../pages/Reports', () => () => <div>Reports Page</div>);
jest.mock('../pages/Accounts', () => () => <div>Accounts Page</div>);

// Mock Firebase hooks
jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: jest.fn(),
}));

// Mock Firebase config
jest.mock('../firebase-config', () => ({
  auth: {},
}));

// Note: recharts is now mocked via the __mocks__ directory

describe('App Component', () => {
  const mockUseAuthState = useAuthState as jest.Mock;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset window location
    window.history.pushState({}, '', '/');
  });

  test('shows loading state when authentication is loading', () => {
    mockUseAuthState.mockReturnValue([null, true, undefined]);
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    mockUseAuthState.mockReturnValue([null, false, undefined]);
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(window.location.pathname).toBe('/login');
  });

  test('shows home page when user is authenticated', () => {
    mockUseAuthState.mockReturnValue([{ uid: '123' }, false, undefined]);
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});