export type UserRole = 'admin' | 'user';

export interface Account {
  firstName: string;
  lastName: string;
  role: UserRole;
  email: string;
  password: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: { id: string; name?: string; slug?: string };
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}
