import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Account, PaginatedResponse, Product } from '../types/models';

export class ShopApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async getProducts(query?: Record<string, string | number | boolean>): Promise<APIResponse> {
    return this.request.get('/products', { params: query });
  }

  async searchProducts(text: string): Promise<APIResponse> {
    return this.request.get('/products/search', { params: { q: text } });
  }

  async getProductById(id: string): Promise<APIResponse> {
    return this.request.get(`/products/${id}`);
  }

  async getCategories(): Promise<APIResponse> {
    return this.request.get('/categories');
  }

  async login(account: Account): Promise<APIResponse> {
    return this.request.post('/users/login', {
      data: {
        email: account.email,
        password: account.password,
      },
    });
  }

  async extractTokenFromLogin(response: APIResponse): Promise<string | null> {
    const json = await response.json();
    return json.access_token ?? json.token ?? json?.data?.access_token ?? null;
  }

  async getProfile(token: string): Promise<APIResponse> {
    return this.request.get('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getInvoices(token: string): Promise<APIResponse> {
    return this.request.get('/invoices', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createCart(): Promise<APIResponse> {
    return this.request.post('/carts');
  }

  async addItemToCart(cartId: string, productId: string, quantity = 1): Promise<APIResponse> {
    return this.request.post(`/carts/${cartId}`, {
      data: { product_id: productId, quantity },
    });
  }

  async getCart(cartId: string): Promise<APIResponse> {
    return this.request.get(`/carts/${cartId}`);
  }

  async updateItemQuantity(cartId: string, productId: string, quantity: number): Promise<APIResponse> {
    return this.request.put(`/carts/${cartId}/product/quantity`, {
      data: { product_id: productId, quantity },
    });
  }

  async removeItemFromCart(cartId: string, productId: string): Promise<APIResponse> {
    return this.request.delete(`/carts/${cartId}/product/${productId}`);
  }

  async asProducts(response: APIResponse): Promise<PaginatedResponse<Product>> {
    return (await response.json()) as PaginatedResponse<Product>;
  }
}
