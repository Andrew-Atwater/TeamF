import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Reports from '../pages/Reports';
import { cleanup } from '@testing-library/react';

// Mock recharts components
jest.mock('recharts', () => ({
    LineChart: () => null,
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    ResponsiveContainer: ({ children }) => children
}));

// Mock the firebase-config module
jest.mock('../firebase-config', () => ({
    auth: {
        currentUser: { uid: 'testUser123' },
        onAuthStateChanged: jest.fn((callback) => {
            callback({ uid: 'testUser123' });
            return () => {};
        })
    },
    db: {}
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn((query) => {
        // Return accounts data for accounts query
        if (query?.toString().includes('accounts')) {
            return Promise.resolve({
                forEach: (callback) => {
                    callback({
                        id: '1',
                        data: () => ({
                            id: '1',
                            name: 'Savings Account',
                            balance: 1000.00,
                            type: 'savings',
                            userId: 'testUser123'
                        })
                    });
                }
            });
        }
        // Return transactions data for transactions query
        return Promise.resolve({
            forEach: (callback) => {
                callback({
                    id: '1',
                    data: () => ({
                        id: '1',
                        accountId: '1',
                        type: 'create',
                        newBalance: 1000.00,
                        timestamp: { toDate: () => new Date('2024-01-01') },
                        description: 'Initial deposit'
                    })
                });
            }
        });
    })
}));

const renderComponent = async () => {
    let rendered;
    await act(async () => {
        rendered = render(
            <BrowserRouter>
                <Reports />
            </BrowserRouter>
        );
    });
    
    // Wait for loading to complete
    await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    return rendered;
};

describe('Reports Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(cleanup);

    test('renders reports page with header', async () => {
        await renderComponent();
        // Use getByRole to find the h1 heading
        expect(screen.getByRole('heading', { level: 1, name: 'Reports' })).toBeInTheDocument();
    });

    test('shows loading state initially', async () => {
        render(
            <BrowserRouter>
                <Reports />
            </BrowserRouter>
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('displays accounts after loading', async () => {
        await renderComponent();
        expect(screen.getByText('Savings Account')).toBeInTheDocument();
    });

    test('opens dialog when account is clicked', async () => {
        await renderComponent();
        await act(async () => {
            fireEvent.click(screen.getByText('Savings Account'));
        });
        await waitFor(() => {
            // Check for dialog title text and role
            const dialogTitle = screen.getByRole('dialog');
            expect(dialogTitle).toBeInTheDocument();
            expect(screen.getByText('Transaction History -')).toBeInTheDocument();
        });
    });

    test('closes dialog when close button is clicked', async () => {
        await renderComponent();
        await act(async () => {
            fireEvent.click(screen.getByText('Savings Account'));
        });
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
        await act(async () => {
            fireEvent.click(screen.getByText('Close'));
        });
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });
});