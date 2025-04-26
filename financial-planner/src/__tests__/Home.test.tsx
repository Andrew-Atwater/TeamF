import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Home from '../pages/Home';

// Mock Firebase modules
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    getApp: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(() => ({
        forEach: (callback: (doc: { id: string; data: () => any }) => void) => {
            mockAccounts.forEach((doc) => {
                callback({
                    id: doc.id,
                    data: () => doc
                });
            });
        }
    })),
    addDoc: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn()
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn()
}));

// Mock firebase-config
jest.mock('../firebase-config', () => ({
    db: {},
    auth: {}
}));

const mockUser = {
    uid: 'testUser123',
    email: 'test@example.com',
    displayName: 'Test User'
};

// Mock Firebase Firestore
const mockAccounts = [
    {
        id: '1',
        name: 'Savings Account',
        balance: 1000.00,
        description: 'Main savings',
        type: 'savings',
        userId: 'testUser123',
        dueDate: null
    },
    {
        id: '2',
        name: 'Credit Card',
        balance: -500.00,
        description: 'Credit card debt',
        type: 'debt',
        userId: 'testUser123',
        dueDate: '2024-05-15'
    }
];

const mockTransactions = [
    {
        id: '1',
        accountId: '1',
        accountName: 'Savings Account',
        userId: 'testUser123',
        type: 'create',
        newBalance: 1000.00,
        timestamp: new Date(),
        description: 'Initial deposit'
    }
];

const renderComponent = () => {
    render(
        <BrowserRouter>
            <Home />
        </BrowserRouter>
    );
};

describe('Home Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
            callback(mockUser);
            return () => {};
        });
    });

    test('renders Financial Dashboard header', () => {
        renderComponent();
        expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
    });

    test('displays accounts when user is authenticated', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('Savings Account')).toBeInTheDocument();
            expect(screen.getByText('Credit Card')).toBeInTheDocument();
        });
    });

    test('shows correct account balances', async () => {
        renderComponent();
        await waitFor(() => {
            const balances = screen.getAllByRole('heading', { level: 5 });
            expect(balances[0]).toHaveTextContent('$1000.00');
            expect(balances[1]).toHaveTextContent('$500.00');
        });
    });

    test('displays account actions speed dial', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /account actions/i })).toBeInTheDocument();
        });
    });

    test('opens add account dialog when clicking add action', async () => {
        renderComponent();
        const speedDialButton = screen.getByRole('button', { name: /account actions/i });
        fireEvent.click(speedDialButton);
        
        const addAccountButton = screen.getByRole('menuitem', { name: /add account/i });
        fireEvent.click(addAccountButton);

        await waitFor(() => {
            expect(screen.getByText('Add New Account')).toBeInTheDocument();
        });
    });

    test('opens edit mode when clicking edit action', async () => {
        renderComponent();
        const speedDialButton = screen.getByRole('button', { name: /account actions/i });
        fireEvent.click(speedDialButton);
        
        const editButton = screen.getByRole('menuitem', { name: /edit accounts/i });
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(screen.getByText('Exit Edit Mode')).toBeInTheDocument();
        });
    });

    test('shows loading state initially', () => {
        renderComponent();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('displays transaction history section', () => {
        renderComponent();
        expect(screen.getByText('Transaction History')).toBeInTheDocument();
    });

    test('opens navigation drawer when clicking menu button', async () => {
        renderComponent();
        const menuButton = screen.getByRole('button', { name: /menu/i });
        fireEvent.click(menuButton);
        
        await waitFor(() => {
            expect(screen.getByText('Add Transaction')).toBeInTheDocument();
        });
    });
});
