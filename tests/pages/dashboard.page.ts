import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Dashboard Overview
 * Handles dashboard widgets, charts, and summary data
 */
export class DashboardPage {
  readonly page: Page;
  readonly dashboardContainer: Locator;
  readonly summaryCards: Locator;
  readonly chartContainer: Locator;
  readonly recentTransactions: Locator;
  readonly alertsPanel: Locator;
  readonly refreshButton: Locator;
  readonly timeRangeSelector: Locator;
  readonly exportDashboardButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardContainer = page.locator('[data-testid="dashboard-container"]');
    this.summaryCards = page.locator('[data-testid="summary-cards"]');
    this.chartContainer = page.locator('[data-testid="chart-container"]');
    this.recentTransactions = page.locator('[data-testid="recent-transactions"]');
    this.alertsPanel = page.locator('[data-testid="alerts-panel"]');
    this.refreshButton = page.locator('[data-testid="refresh-dashboard"]');
    this.timeRangeSelector = page.locator('[data-testid="time-range-selector"]');
    this.exportDashboardButton = page.locator('[data-testid="export-dashboard"]');
  }

  /**
   * Navigate to dashboard
   */
  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.waitForDashboardLoad();
  }

  /**
   * Wait for dashboard to fully load
   */
  async waitForDashboardLoad(): Promise<void> {
    await expect(this.dashboardContainer).toBeVisible();
    await expect(this.summaryCards).toBeVisible();
    await expect(this.chartContainer).toBeVisible();
  }

  /**
   * Get summary card value
   */
  async getSummaryCardValue(cardName: string): Promise<string> {
    const card = this.summaryCards.locator(`[data-testid="${cardName}-card"]`);
    const value = card.locator('[data-testid="card-value"]');
    return await value.textContent() || '';
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard(): Promise<void> {
    await this.refreshButton.click();
    await this.waitForDashboardLoad();
  }

  /**
   * Change time range
   */
  async selectTimeRange(range: 'today' | 'week' | 'month' | 'year'): Promise<void> {
    await this.timeRangeSelector.click();
    await this.page.locator(`[data-value="${range}"]`).click();
    await this.waitForDashboardLoad();
  }

  /**
   * Navigate to bank reconciliation from dashboard
   */
  navigateToBankReconciliation = async (): Promise<void> => {
    await this.page.locator('[data-testid="nav-bank-reconciliation"]').click();
  }

  /**
   * Verify chart is rendered
   */
    verifyChartRendered = async (): Promise<void> => {
    await expect(this.chartContainer.locator('canvas, svg')).toBeVisible();
  }
}
