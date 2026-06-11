/**
 * Mock API Server for QA Coding Test
 * Simulates bank reconciliation backend services
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Mock database
let transactions = [];
let testSessions = new Map();

// Generate mock transaction
const generateTransaction = (id) => {
    const statuses = ['pending', 'reconciled', 'disputed'];
    const currencies = ['USD', 'EUR', 'GBP', 'CAD'];
    const descriptions = [
        'Payment received from client',
        'Bank transfer - salary',
        'Online purchase - supplies',
        'ATM withdrawal',
        'Direct debit - utilities',
        'Wire transfer - international'
    ];

    return {
        id: id || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        amount: parseFloat((Math.random() * 10000 + 1).toFixed(4)),
        currency: currencies[Math.floor(Math.random() * currencies.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        accountNumber: Math.random().toString().substr(2, 8),
        referenceNumber: Math.random().toString(36).substr(2, 10).toUpperCase()
    };
};

// Initialize with some transactions
for (let i = 0; i < 1000; i++) {
    transactions.push(generateTransaction(`TXN-${String(i + 1).padStart(6, '0')}`));
}

// API Routes

// Get transactions with filtering, sorting, pagination
app.get('/api/transactions', (req, res) => {
    const {
        page = 1,
        limit = 100,
        sortBy = 'date',
        sortOrder = 'desc',
        status,
        search
    } = req.query;

    let filteredTransactions = [...transactions];

    // Apply status filter
    if (status) {
        const statusArray = Array.isArray(status) ? status : [status];
        filteredTransactions = filteredTransactions.filter(t =>
            statusArray.includes(t.status)
        );
    }

    // Apply search filter
    if (search) {
        const searchLower = search.toLowerCase();
        filteredTransactions = filteredTransactions.filter(t =>
            t.id.toLowerCase().includes(searchLower) ||
            t.description.toLowerCase().includes(searchLower) ||
            t.accountNumber.includes(search)
        );
    }

    // Apply sorting
    filteredTransactions.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        if (sortBy === 'amount') {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
        } else if (sortBy === 'date') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }

        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    // Simulate network delay
    const delay = Math.random() * 500 + 200;
    setTimeout(() => {
        res.json({
            data: paginatedTransactions,
            total: filteredTransactions.length,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(filteredTransactions.length / limit)
        });
    }, delay);
});

// Get specific transaction
app.get('/api/transactions/:id', (req, res) => {
    const transaction = transactions.find(t => t.id === req.params.id);
    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
});

// Update transaction
app.put('/api/transactions/:id', (req, res) => {
    const transactionIndex = transactions.findIndex(t => t.id === req.params.id);
    if (transactionIndex === -1) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    // Validate amount field
    if (req.body.amount !== undefined) {
        const amount = parseFloat(req.body.amount);
        if (isNaN(amount) || amount < 0 || amount > 999999.99) {
            return res.status(400).json({ 
                error: 'Invalid amount', 
                message: 'Amount must be between 0 and 999,999.99' 
            });
        }
    }

    // Validate description field
    if (req.body.description !== undefined && req.body.description.length > 100) {
        return res.status(400).json({ 
            error: 'Invalid description', 
            message: 'Description must be 100 characters or less' 
        });
    }

    // Simulate validation delay
    setTimeout(() => {
        transactions[transactionIndex] = { ...transactions[transactionIndex], ...req.body };

        // Broadcast update via WebSocket
        broadcastUpdate({
            type: 'transaction_updated',
            data: transactions[transactionIndex]
        });

        res.json(transactions[transactionIndex]);
    }, 300);
});

// Seed test data
app.post('/api/transactions/seed', (req, res) => {
    const { transactions: newTransactions, testId } = req.body;

    if (!testId) {
        return res.status(400).json({ error: 'Test ID required' });
    }

    // Store test session data
    testSessions.set(testId, newTransactions.map(t => t.id));

    // Add transactions to main array
    transactions.push(...newTransactions);

    res.json({
        message: 'Transactions seeded successfully',
        count: newTransactions.length,
        testId
    });
});

// Cleanup test data
app.delete('/api/transactions/cleanup', (req, res) => {
    const { testId } = req.query;

    if (testId && testSessions.has(testId)) {
        const testTransactionIds = testSessions.get(testId);
        transactions = transactions.filter(t => !testTransactionIds.includes(t.id));
        testSessions.delete(testId);

        res.json({
            message: 'Test data cleaned up successfully',
            testId,
            removedCount: testTransactionIds.length
        });
    } else {
        // Clean up all test data if no specific test ID
        const originalCount = transactions.length;
        transactions = transactions.filter(t => t.id.startsWith('TXN-') && !t.id.includes('-test-'));
        testSessions.clear();

        res.json({
            message: 'All test data cleaned up',
            removedCount: originalCount - transactions.length
        });
    }
});

// File upload simulation
app.post('/api/transactions/upload', (req, res) => {
    // Simulate file processing delay
    setTimeout(() => {
        const newTransactions = [];
        const uploadCount = Math.floor(Math.random() * 50) + 10;

        for (let i = 0; i < uploadCount; i++) {
            newTransactions.push(generateTransaction());
        }

        transactions.push(...newTransactions);

        res.json({
            message: 'File uploaded successfully',
            addedCount: newTransactions.length,
            newTransactions
        });
    }, 1500);
});

// Performance metrics endpoint
app.get('/api/performance/metrics', (req, res) => {
    res.json({
        transactionCount: transactions.length,
        averageLoadTime: Math.random() * 1000 + 500,
        serverHealth: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Error simulation endpoint
app.get('/api/transactions/error', (req, res) => {
    const errorTypes = [400, 401, 403, 404, 500, 502, 503];
    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];

    res.status(randomError).json({
        error: `Simulated ${randomError} error`,
        message: 'This is a test error for QA automation'
    });
});

// WebSocket setup for real-time updates
const server = require('http').createServer(app);
const wss = new WebSocketServer({ server });

let wsClients = [];

wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    wsClients.push(ws);

    // Send initial connection message
    ws.send(JSON.stringify({
        type: 'connection_established',
        message: 'Connected to bank reconciliation updates'
    }));

    ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
        wsClients = wsClients.filter(client => client !== ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Broadcast updates to all connected clients
function broadcastUpdate(data) {
    const message = JSON.stringify(data);
    wsClients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
        }
    });
}

// Simulate periodic transaction status updates
setInterval(() => {
    if (transactions.length > 0 && Math.random() < 0.3) {
        const randomTransaction = transactions[Math.floor(Math.random() * transactions.length)];
        const statuses = ['pending', 'reconciled', 'disputed'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

        randomTransaction.status = newStatus;

        broadcastUpdate({
            type: 'transaction_status_changed',
            data: randomTransaction
        });
    }
}, 10000);

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve bank reconciliation page
app.get('/bank-reconciliation', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        transactionCount: transactions.length,
        activeConnections: wsClients.length
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Mock Bank Reconciliation App running on http://localhost:${PORT}`);
    console.log(`📊 Serving ${transactions.length} initial transactions`);
    console.log(`🔌 WebSocket server ready for real-time updates`);
    console.log(`🧪 QA Coding Test environment ready!`);
});

module.exports = app;
