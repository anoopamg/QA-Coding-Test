# Playwright QA Coding Test

## 🎯 Overview
**Time:** 30 minutes  
**Objective:** Complete a working test for a bank transaction grid

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Mock Application
```bash
npm run start:app
```
The app will be available at: http://localhost:3000


## 📋 Your Task

Complete **ONE** working test by implementing the missing methods in these files:

### Files to Edit:
- `tests/pages/bank-reconciliation.page.ts` - Complete the page object methods
- `tests/specs/bank-reconciliation.spec.ts` - Implement the test

### What You Need to Do:
1. **Navigate to the page** - Complete the `navigateTo()` method
2. **Get row count** - Extract the number from the row count display
3. **Get transaction data** - Extract data from a specific row
4. **Write test assertions** - Verify the grid works correctly

## 📖 Helpful Tips

### Key Selectors:
- Grid: `[data-testid="transactions-grid"]`
- Row count: `[data-testid="row-count"]`
- Specific row: `[data-rowindex="${index}"]`

### Common Patterns:
```typescript
// Wait for element to be visible
await expect(this.dataGrid).toBeVisible();

// Extract text content
const text = await element.textContent();

// Navigate to page
await this.page.goto('/bank-reconciliation');
```

## 🏁 Getting Help

- The mock app shows 1000 bank transactions
- Look for TODO comments in the code for guidance
- Use browser dev tools to inspect elements

Good luck! 🎯
