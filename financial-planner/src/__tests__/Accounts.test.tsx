import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Accounts from '../pages/Accounts';

// Create mock auth instance
const mockAuth = {
    currentUser: { uid: 'testUser123' },
    onAuthStateChanged: jest.fn((callback) => {
        callback({ uid: 'testUser123' });
        return () => {};
    })
};

// Mock firebase-config module first
jest.mock('../firebase-config', () => {
    const mockAuth = {
        currentUser: { uid: 'testUser123' },
        onAuthStateChanged: jest.fn((callback) => {
            callback({ uid: 'testUser123' });
            return () => {};
        }),
    };
    const mockDb = {};
    return {
        __esModule: true, // Add this to properly handle ES modules
        auth: mockAuth,
        db: mockDb,
        default: { auth: mockAuth, db: mockDb },
    };
});

// Mock Firebase Auth module
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => mockAuth)
}));

// Mock Firebase Firestore module
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

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(() => Promise.resolve({
        forEach: (callback: (doc: { id: string; data: () => any }) => void) => {
            mockAccounts.forEach((doc) => {
                callback({
                    id: doc.id,
                    data: () => doc
                });
            });
        }
    })),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn()
}));

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

const renderComponent = () => {
    render(
        <BrowserRouter>
            <Accounts />
        </BrowserRouter>
    );
};

describe('Accounts Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders Accounts header', () => {
        renderComponent();
        const headers = screen.getAllByText('Accounts');
        expect(headers.length).toBeGreaterThan(0);
    });

    test('shows loading state initially', () => {
        renderComponent();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('displays accounts when loaded', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('Savings Account')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText('Credit Card')).toBeInTheDocument();
        });
    });

    test('displays correct account balances', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('$1000.00')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText('$500.00')).toBeInTheDocument();
        });
    });

    test('displays due date for debt accounts', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('Due Date')).toBeInTheDocument();
        });
        // Format matches the date display in the component
        await waitFor(() => {
            expect(screen.getByText('5/15/2024')).toBeInTheDocument();
        });
    });

    test('opens edit dialog when clicking edit button', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getAllByText('Edit')).toHaveLength(2);
        });

        // Get edit buttons and click after the waitFor is complete
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);
        expect(screen.getByText('Edit Account Balance')).toBeInTheDocument();
    });

    test('handles balance updates in edit dialog', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getAllByText('Edit')).toHaveLength(2);
        });

        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);

        const balanceInput = screen.getByLabelText('Balance');
        fireEvent.change(balanceInput, { target: { value: '2000' } });

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.queryByText('Edit Account Balance')).not.toBeInTheDocument();
        });
    });

    test('navigates back when clicking back button', () => {
        renderComponent();
        // Select the first button in the header (the back button)
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[0]);
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('shows no accounts message when empty', async () => {
        jest.mocked(getDocs).mockImplementationOnce(() => Promise.resolve({
            forEach: () => {}, // Empty forEach implementation
            empty: true,
            size: 0,
            docs: [],
            metadata: { 
                fromCache: false, 
                hasPendingWrites: false,
                isEqual: (other: unknown) => true 
            },
            query: {} as any,
            docChanges: () => []
        }));

        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('No accounts found.')).toBeInTheDocument();
        });
    });

    test('handles edit dialog cancel', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getAllByText('Edit')).toHaveLength(2);
        });

        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByText('Edit Account Balance')).not.toBeInTheDocument();
        });
    });

    test('displays account descriptions', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('Main savings')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText('Credit card debt')).toBeInTheDocument();
        });
    });
});