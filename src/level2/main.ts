import { z } from 'zod';
import {
  createLanguageModel,
  createJsonTranslator,
  createOpenAILanguageModel,
} from 'typechat';
import { createZodJsonValidator, getZodSchemaAsTypeScript } from 'typechat/zod';
import { env } from '../env';

const main = async (input: string) => {
  const responseSchema = z.object({
    originalText: z
      .string()
      .describe('元の文章 (問題のある箇所をピンポイントで抽出すること)'),
    fixedText: z.string().describe('誤字脱字を修正した文章'),
    reason: z.string().describe('修正理由'),
  });

  const model = createOpenAILanguageModel(env.OPENAI_API_KEY, 'gpt-4-turbo');
  const validator = createZodJsonValidator(
    { responseSchema },
    'responseSchema'
  );
  const translator = createJsonTranslator(model, validator);

  // リトライ時に、JSONオブジェクトの修復を試みる
  translator.attemptRepair = true;
  const response = await translator.translate(input);

  if (!response.success) {
    throw response;
  }

  console.log({
    修正前の文章: response.data.originalText,
    修正後の文章: response.data.fixedText,
    修正理由: response.data.reason,
  });
};

// Typechatは自然言語を型を満たすように変換する機能に特化している。校閲は別の部分で行われたとする。
const input = `モチベーションが高めることができました→モチベーションを高めることができました。使役表現の誤用`;
main(input);
