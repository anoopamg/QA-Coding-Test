import { test, expect } from '@playwright/test';
import { BankReconciliationPage } from '../pages/bank-reconciliation.page';

test.describe('Bank Reconciliation - Basic Testing', () => {

  test('should display bank transactions correctly', async ({ page }) => {
    const bankPage = new BankReconciliationPage(page);

    // TODO: Implement this test
    // 1. Navigate to the bank reconciliation page
    await bankPage.navigateTo();
    // 2. Verify the page loads correctly  
    await expect(bankPage.dataGrid).toBeVisible();
    // 3. Check that transactions are displayed
    const transaction = await bankPage.getTransactionAtIndex(9);
    expect(transaction).not.toBeNull();
    
    // Extract individual field values from the transaction
    const transactionId = transaction.id;
    const transactionDate = transaction.date;
    const transactionDescription = transaction.description;
    const transactionAmount = transaction.amount;
    const transactionCurrency = transaction.currency;
    const transactionStatus = transaction.status;
    
    // Validate each field has expected data
    expect(transactionId).toMatch(/TXN-/); // Transaction IDs start with TXN-
    
    expect(transactionDate).toMatch(/\d{4}-\d{2}-\d{2}/); // Date format YYYY-MM-DD
    
    expect(transactionDescription.length).toBeGreaterThan(0);
  
    expect(transactionAmount.length).toBeGreaterThan(0);

    expect(['USD', 'EUR', 'GBP', 'CAD']).toContain(transactionCurrency);
   
    expect(['pending', 'reconciled', 'disputed']).toContain(transactionStatus.toLowerCase());
    // 4. Verify row count shows correct number
    const rowCount = await bankPage.getRowCount();
    console.log(`Total transactions loaded: ${rowCount}`);
    expect(rowCount).toBe(1000);
    // Example assertions you might use:
    // await expect(bankPage.dataGrid).toBeVisible();
    // await expect(bankPage.rowCount).toContainText('1000');
  });

  test.skip('live debugging session', async ({ page }) => {
    const bankPage = new BankReconciliationPage(page);
  });
});
