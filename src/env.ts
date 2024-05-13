import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string(),
    ANTHROPIC_API_KEY: z.string(),
  },
  runtimeEnv: process.env,
});
