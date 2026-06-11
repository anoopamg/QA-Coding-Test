/**
 * Mock Bank Reconciliation Dashboard Application
 * QA Coding Test - Simulates complex MUI DataGrid behavior
 */

class BankReconciliationApp {
    constructor() {
        this.transactions = [];
        this.filteredTransactions = [];
        this.currentSort = { field: null, direction: 'asc' };
        this.currentFilter = { status: [] };
        this.websocket = null;
        this.virtualScrollOffset = 0;
        this.rowHeight = 56;
        this.visibleRowCount = 10;

        this.init();
    }

    async init() {
        await this.loadTransactions();
        this.setupEventListeners();
        this.initWebSocket();
        this.renderGrid();
        this.startPerformanceMonitoring();
    }

    // Generate mock transaction data
    generateMockTransactions(count = 1000) {
        const transactions = [];
        const statuses = ['pending', 'reconciled', 'disputed'];
        const currencies = ['USD', 'EUR', 'GBP', 'CAD'];
        const descriptions = [
            'Payment received from client',
            'Bank transfer - salary',
            'Online purchase - supplies',
            'ATM withdrawal',
            'Direct debit - utilities',
            'Wire transfer - international',
            'Credit card payment',
            'Investment dividend',
            'Loan repayment',
            'Service charges'
        ];

        for (let i = 0; i < count; i++) {
            const currency = currencies[Math.floor(Math.random() * currencies.length)];
            const amount = (Math.random() * 10000 + 1).toFixed(4);
            const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

            transactions.push({
                id: `TXN-${String(i + 1).padStart(6, '0')}`,
                date: date.toISOString().split('T')[0],
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                amount: parseFloat(amount),
                currency: currency,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                accountNumber: Math.random().toString().substr(2, 8),
                referenceNumber: Math.random().toString(36).substr(2, 10).toUpperCase()
            });
        }

        return transactions;
    }

    // Simulate API loading with delays
    async loadTransactions() {
        const loadingEl = document.getElementById('loading-indicator');
        loadingEl.style.display = 'flex';

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        try {
            // Simulate occasional API failures for testing
            if (Math.random() < 0.1) {
                throw new Error('API Error');
            }

            this.transactions = this.generateMockTransactions(1000);
            this.filteredTransactions = [...this.transactions];

            loadingEl.style.display = 'none';
        } catch (error) {
            loadingEl.style.display = 'none';
            this.showError('Failed to load transactions');
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Filter functionality
        const filterBtn = document.getElementById('filter-btn');
        const filterMenu = document.getElementById('filter-menu');
        filterBtn.addEventListener('click', () => {
            filterMenu.style.display = filterMenu.style.display === 'none' ? 'block' : 'none';
        });

        // Apply filter
        const applyFilterBtn = document.getElementById('apply-filter');
        applyFilterBtn.addEventListener('click', () => {
            this.applyFilter();
        });

        // Clear filter
        const clearFilterBtn = document.getElementById('clear-filter');
        clearFilterBtn.addEventListener('click', () => {
            this.clearFilter();
        });

        // File upload
        const uploadBtn = document.getElementById('upload-btn');
        uploadBtn.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Column sorting
        const headerCells = document.querySelectorAll('.header-cell');
        headerCells.forEach(cell => {
            cell.addEventListener('click', () => {
                const field = cell.getAttribute('data-field');
                if (field && field !== 'actions') {
                    this.handleSort(field);
                }
            });
        });

        // Virtual scrolling
        const gridBody = document.querySelector('.grid-body');
        gridBody.addEventListener('scroll', () => {
            this.handleVirtualScroll();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        refreshBtn.addEventListener('click', () => {
            this.loadTransactions();
        });
    }

    // WebSocket simulation for real-time updates
    initWebSocket() {
        // Simulate WebSocket connection
        this.websocket = {
            readyState: 1, // WebSocket.OPEN
            send: (data) => console.log('WebSocket send:', data),
            close: () => console.log('WebSocket closed')
        };

        // Simulate real-time transaction updates
        setInterval(() => {
            if (this.transactions.length > 0 && Math.random() < 0.3) {
                const randomIndex = Math.floor(Math.random() * this.transactions.length);
                const statuses = ['pending', 'reconciled', 'disputed'];
                const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

                this.transactions[randomIndex].status = newStatus;
                this.filteredTransactions = this.applyCurrentFilters();
                this.renderGrid();

                // Expose WebSocket for testing
                window.bankRecWebSocket = this.websocket;
            }
        }, 5000);
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.filteredTransactions = [...this.transactions];
        } else {
            this.filteredTransactions = this.transactions.filter(transaction =>
                transaction.id.toLowerCase().includes(query.toLowerCase()) ||
                transaction.description.toLowerCase().includes(query.toLowerCase()) ||
                transaction.accountNumber.includes(query)
            );
        }
        this.renderGrid();
    }

    handleSort(field) {
        const direction = this.currentSort.field === field && this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        this.currentSort = { field, direction };

        // Simulate server-side sorting delay
        const loadingEl = document.getElementById('loading-indicator');
        loadingEl.style.display = 'flex';

        setTimeout(() => {
            this.filteredTransactions.sort((a, b) => {
                let aVal = a[field];
                let bVal = b[field];

                if (field === 'amount') {
                    aVal = parseFloat(aVal);
                    bVal = parseFloat(bVal);
                } else if (field === 'date') {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
                }

                if (direction === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });

            this.updateSortIndicators(field, direction);
            this.renderGrid();
            loadingEl.style.display = 'none';
        }, 300);
    }

    updateSortIndicators(field, direction) {
        // Reset all indicators
        document.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.className = 'sort-indicator';
            indicator.textContent = '⇅';
        });

        // Update active indicator
        const activeIndicator = document.querySelector(`[data-field="${field}"] .sort-indicator`);
        if (activeIndicator) {
            activeIndicator.className = `sort-indicator ${direction}`;
        }
    }

    applyFilter() {
        const statusCheckboxes = document.querySelectorAll('[data-testid^="status-"]');
        const selectedStatuses = [];

        statusCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const status = checkbox.getAttribute('data-testid').replace('status-', '');
                selectedStatuses.push(status);
            }
        });

        this.currentFilter.status = selectedStatuses;
        this.filteredTransactions = this.applyCurrentFilters();
        this.renderGrid();
        document.getElementById('filter-menu').style.display = 'none';
    }

    clearFilter() {
        document.querySelectorAll('[data-testid^="status-"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.currentFilter.status = [];
        this.filteredTransactions = [...this.transactions];
        this.renderGrid();
        document.getElementById('filter-menu').style.display = 'none';
    }

    applyCurrentFilters() {
        let filtered = [...this.transactions];

        if (this.currentFilter.status.length > 0) {
            filtered = filtered.filter(transaction =>
                this.currentFilter.status.includes(transaction.status)
            );
        }

        return filtered;
    }

    async handleFileUpload(file) {
        if (!file) return;

        const loadingEl = document.getElementById('loading-indicator');
        loadingEl.style.display = 'flex';

        // Simulate file processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate adding new transactions from file
        const newTransactions = this.generateMockTransactions(50);
        this.transactions = [...this.transactions, ...newTransactions];
        this.filteredTransactions = this.applyCurrentFilters();

        loadingEl.style.display = 'none';
        this.renderGrid();
    }

    handleVirtualScroll() {
        const gridBody = document.querySelector('.grid-body');
        const scrollTop = gridBody.scrollTop;
        const containerHeight = gridBody.clientHeight;

        const startIndex = Math.floor(scrollTop / this.rowHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / this.rowHeight) + 5,
            this.filteredTransactions.length
        );

        this.virtualScrollOffset = startIndex;
        this.visibleRowCount = endIndex - startIndex;

        this.renderVisibleRows();
    }

    handleKeyboardNavigation(e) {
        const focusedRow = document.querySelector('.grid-row:focus');
        if (!focusedRow) return;

        const currentIndex = parseInt(focusedRow.getAttribute('data-index'));
        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                newIndex = Math.min(currentIndex + 1, this.filteredTransactions.length - 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                newIndex = Math.max(currentIndex - 1, 0);
                break;
            case 'Enter':
                e.preventDefault();
                this.editCell(focusedRow, 'amount');
                break;
        }

        if (newIndex !== currentIndex) {
            const newRow = document.querySelector(`[data-index="${newIndex}"]`);
            if (newRow) {
                newRow.focus();
                newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    editCell(row, field) {
        const cell = row.querySelector(`[data-field="${field}"]`);
        if (!cell) return;

        const currentValue = cell.textContent.replace(/[$€£C]/g, '').trim();
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.className = 'edit-input';

        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();
        input.select();

        const finishEdit = async () => {
            const newValue = parseFloat(input.value);
            if (!isNaN(newValue)) {
                const transactionId = row.getAttribute('data-id');
                const transaction = this.filteredTransactions.find(t => t.id === transactionId);

                if (transaction) {
                    // Simulate async validation
                    await new Promise(resolve => setTimeout(resolve, 500));
                    transaction.amount = newValue;
                    this.formatCurrencyCell(cell, newValue, transaction.currency);
                }
            } else {
                // Restore original value
                const transactionId = row.getAttribute('data-id');
                const transaction = this.filteredTransactions.find(t => t.id === transactionId);
                if (transaction) {
                    this.formatCurrencyCell(cell, transaction.amount, transaction.currency);
                }
            }
        };

        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishEdit();
            } else if (e.key === 'Escape') {
                const transactionId = row.getAttribute('data-id');
                const transaction = this.filteredTransactions.find(t => t.id === transactionId);
                if (transaction) {
                    this.formatCurrencyCell(cell, transaction.amount, transaction.currency);
                }
            }
        });
    }

    formatCurrencyCell(cell, amount, currency) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        });

        cell.innerHTML = `<span class="currency-amount currency-${currency.toLowerCase()}">${formatter.format(amount)}</span>`;
        cell.classList.add('editable-cell');
    }

    renderGrid() {
        const gridBody = document.querySelector('.virtual-scroller');
        const totalHeight = this.filteredTransactions.length * this.rowHeight;

        // Set virtual scroller height
        gridBody.style.height = `${totalHeight}px`;

        this.renderVisibleRows();

        // Show/hide no data overlay
        const noDataOverlay = document.getElementById('no-data-overlay');
        if (this.filteredTransactions.length === 0) {
            noDataOverlay.style.display = 'block';
        } else {
            noDataOverlay.style.display = 'none';
        }
    }

    renderVisibleRows() {
        const virtualScroller = document.querySelector('.virtual-scroller');
        const startIndex = this.virtualScrollOffset;
        const endIndex = Math.min(startIndex + this.visibleRowCount, this.filteredTransactions.length);

        // Clear existing rows
        virtualScroller.innerHTML = '';

        // Create container for visible rows
        const rowsContainer = document.createElement('div');
        rowsContainer.style.position = 'absolute';
        rowsContainer.style.top = `${startIndex * this.rowHeight}px`;
        rowsContainer.style.width = '100%';

        for (let i = startIndex; i < endIndex; i++) {
            const transaction = this.filteredTransactions[i];
            if (transaction) {
                const row = this.createTransactionRow(transaction, i);
                rowsContainer.appendChild(row);
            }
        }

        virtualScroller.appendChild(rowsContainer);
    }

    createTransactionRow(transaction, index) {
        const row = document.createElement('div');
        row.className = 'grid-row';
        row.setAttribute('data-id', transaction.id);
        row.setAttribute('data-index', index);
        row.setAttribute('tabindex', '0');
        row.style.height = `${this.rowHeight}px`;

        row.innerHTML = `
            <div class="grid-cell" data-field="id">${transaction.id}</div>
            <div class="grid-cell" data-field="date">${transaction.date}</div>
            <div class="grid-cell" data-field="description">${transaction.description}</div>
            <div class="grid-cell editable-cell" data-field="amount"></div>
            <div class="grid-cell" data-field="currency">${transaction.currency}</div>
            <div class="grid-cell" data-field="status">
                <span class="status-badge status-${transaction.status}">${transaction.status}</span>
            </div>
            <div class="grid-cell" data-field="actions">
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px;">Edit</button>
            </div>
        `;

        // Format currency amount
        const amountCell = row.querySelector('[data-field="amount"]');
        this.formatCurrencyCell(amountCell, transaction.amount, transaction.currency);

        // Add double-click edit functionality
        amountCell.addEventListener('dblclick', () => {
            this.editCell(row, 'amount');
        });

        return row;
    }

    showError(message) {
        const errorEl = document.getElementById('error-message');
        errorEl.querySelector('span').textContent = message;
        errorEl.style.display = 'block';

        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 5000);
    }

    startPerformanceMonitoring() {
        // Expose performance metrics for testing
        window.bankRecPerformance = {
            getMetrics: () => {
                const navigation = performance.getEntriesByType('navigation')[0];
                return {
                    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
                };
            }
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bankRecApp = new BankReconciliationApp();
});
