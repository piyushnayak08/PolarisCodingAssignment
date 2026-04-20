import { test, expect, defaultApiAccount } from '../../src/fixtures/api.fixture';

test.describe('Auth, cart and orders API validations', () => {
  test('US5 positive: valid user can login and obtain token', async ({ apiClient }) => {
    const loginResponse = await apiClient.login(defaultApiAccount);
    expect(loginResponse.ok()).toBeTruthy();
    const token = await apiClient.extractTokenFromLogin(loginResponse);
    expect(token).toBeTruthy();

    const meResponse = await apiClient.getProfile(token as string);
    expect(meResponse.ok()).toBeTruthy();
    const me = await meResponse.json();
    expect(String(me.first_name ?? me?.data?.first_name ?? '')).toMatch(/Jane/i);
  });

  test('US5 negative: invalid login credentials are rejected', async ({ request }) => {
    const response = await request.post('/users/login', {
      data: {
        email: 'wrong.user@example.com',
        password: 'wrong-pass',
      },
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('US6/US7 positive: create cart, add item, update quantity and remove item', async ({ apiClient }) => {
    const productsResponse = await apiClient.getProducts();
    const products = await productsResponse.json();
    const productId = String(products.data[0].id);

    const createCartResponse = await apiClient.createCart();
    expect(createCartResponse.ok()).toBeTruthy();
    const createCartBody = await createCartResponse.json();
    const cartId = String(createCartBody.id ?? createCartBody.cart_id);

    const addItemResponse = await apiClient.addItemToCart(cartId, productId, 1);
    expect(addItemResponse.ok()).toBeTruthy();

    const updateQuantityResponse = await apiClient.updateItemQuantity(cartId, productId, 2);
    expect(updateQuantityResponse.ok()).toBeTruthy();

    const removeItemResponse = await apiClient.removeItemFromCart(cartId, productId);
    expect(removeItemResponse.ok()).toBeTruthy();
  });

  test('US7 negative: invalid cart update request should fail', async ({ request }) => {
    const response = await request.put('/carts/invalid-cart-id/product/quantity', {
      data: {
        product_id: 'invalid-product-id',
        quantity: -1,
      },
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('US9 positive/edge: order history endpoint contract exists for authenticated user', async ({ apiClient }) => {
    const loginResponse = await apiClient.login(defaultApiAccount);
    const token = await apiClient.extractTokenFromLogin(loginResponse);
    expect(token).toBeTruthy();

    const ordersResponse = await apiClient.getInvoices(token as string);

    expect([200, 204]).toContain(ordersResponse.status());
  });
});
