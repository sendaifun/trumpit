import { createClient } from 'redis';

// Create Redis client
const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', err => console.error('Redis Client Error:', err));

// Connect to Redis
client.connect().catch(console.error);

/**
 * Get value for a key from Redis
 */
export async function get(key: string): Promise<string | null> {
    try {
        return await client.get(key);
    } catch (error) {
        console.error('Redis get error:', error);
        return null;
    }
}

/**
 * Set value for a key in Redis
 */
export async function set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
        if (ttlSeconds) {
            await client.set(key, value, {
                EX: ttlSeconds
            });
        } else {
            await client.set(key, value);
        }
        return true;
    } catch (error) {
        console.error('Redis set error:', error);
        return false;
    }
}
