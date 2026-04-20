import dotenv from 'dotenv';

dotenv.config();

const target = process.env.TEST_TARGET ?? 'main';

export const env = {
  target,
  isBuggyTarget: target === 'buggy',
  baseUrl:
    target === 'buggy'
      ? process.env.BASE_URL_BUGGY ?? 'https://with-bugs.practicesoftwaretesting.com'
      : process.env.BASE_URL_MAIN ?? 'https://practicesoftwaretesting.com',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://api.practicesoftwaretesting.com',
  defaultTimeoutMs: Number(process.env.DEFAULT_TIMEOUT_MS ?? 30000),
};
