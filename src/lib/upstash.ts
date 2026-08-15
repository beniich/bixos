import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('❌ Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN in .env');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  retry: {
    retries: 3,
    backoff: (retryCount) => Math.exp(retryCount) * 50,
  },
});

// Helper: Pipeline wrapper
export async function redisPipeline(commands: Array<[string, ...any[]]>) {
  return redis.pipeline().exec();
}
