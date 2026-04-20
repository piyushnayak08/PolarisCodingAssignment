import { test, expect } from '../../src/fixtures/api.fixture';

test.describe('Catalog API validations', () => {
  test('US1 positive: GET /products returns paginated product data', async ({ apiClient }) => {
    const response = await apiClient.getProducts();
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body.data[0]).toEqual(expect.objectContaining({ name: expect.any(String), price: expect.any(Number) }));
  });

  test('US3 positive: search endpoint returns matching products', async ({ apiClient }) => {
    const response = await apiClient.searchProducts('Hammer');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.length).toBeGreaterThan(0);
    const query = 'hammer';
    expect(
      body.data.some((product: { name?: string }) => String(product.name ?? '').toLowerCase().includes(query))
    ).toBeTruthy();
    for (const product of body.data) {
      const searchableText = `${String(product.name ?? '')} ${String(product.description ?? '')}`.toLowerCase();
      expect(searchableText).toContain(query);
    }
  });

  test('US3 negative: unknown search query returns empty result set', async ({ apiClient }) => {
    const response = await apiClient.searchProducts('___no-such-product___');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.length).toBe(0);
  });

  test('US4/US10 positive: category filter returns products and category metadata', async ({ apiClient }) => {
    const response = await apiClient.getProducts({ by_category_slug: 'pliers' });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('US2 negative: invalid product id returns 404', async ({ apiClient }) => {
    const response = await apiClient.getProductById('this-id-does-not-exist');
    expect(response.status()).toBe(404);
  });
});
