import { Client } from 'pg';

let client: Client | null = null;

export function getClient(): Client {
  if (!client) {
    client = new Client({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/ale_kircha',
    });
  }
  return client;
}

export async function connectDB() {
  const client = getClient();
  if (!client._connected) {
    await client.connect();
    console.log('✅ PostgreSQL connected');
  }
  return client;
}

export async function query(sql: string, params?: any[]) {
  const client = await connectDB();
  try {
    const result = await client.query(sql, params);
    return result;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
}

export async function disconnectDB() {
  if (client) {
    await client.end();
    client = null;
    console.log('✅ PostgreSQL disconnected');
  }
}
