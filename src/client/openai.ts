import OpenAI from 'openai/index.mjs';
import { env } from '../env';

export const openAI = new OpenAI({ apiKey: env.OPENAI_API_KEY });
