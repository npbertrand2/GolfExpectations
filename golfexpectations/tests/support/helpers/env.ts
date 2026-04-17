export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getBaseUrl(): string {
  return process.env.BASE_URL ?? "http://127.0.0.1:5173";
}
