import type { Account } from '../types/models';

export const accounts: Record<'john' | 'jane' | 'jack' | 'bob', Account> = {
  john: {
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin',
    email: 'admin@practicesoftwaretesting.com',
    password: 'welcome01',
  },
  jane: {
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'user',
    email: 'customer@practicesoftwaretesting.com',
    password: 'welcome01',
  },
  jack: {
    firstName: 'Jack',
    lastName: 'Howe',
    role: 'user',
    email: 'customer2@practicesoftwaretesting.com',
    password: 'welcome01',
  },
  bob: {
    firstName: 'Bob',
    lastName: 'Smith',
    role: 'user',
    email: 'customer3@practicesoftwaretesting.com',
    password: 'pass123',
  },
};

export const defaultUiAccount = accounts.jane;
