import { z } from 'zod';
import { zodToTs, printNode } from 'zod-to-ts';
import { retryAsync, isTooManyTries } from 'ts-retry';
import { anthropic } from '../client/anthropic';

const main = async (input: string) => {
  const jsonStringSchema = z.string().transform((s) => JSON.parse(s));
  const responseSchema = z
    .object({
      originalText: z
        .string()
        .describe('元の文章 (問題のある箇所をピンポイントで抽出すること)'),
      fixedText: z.string().describe('誤字脱字を修正した文章'),
      reason: z.string().describe('修正理由'),
    })
    .array();

  type Response = z.infer<typeof responseSchema>;

  // Zodスキーマを型の文字列に変換
  const schemaString = printNode(zodToTs(responseSchema).node);

  const systemPrompt = `
  あなたは校閲です。入力された文章の誤字脱字を修正してください。

  # 要件
  - 細かい誤字脱字も指摘すること
  - JSONで出力し、以下の出力フォーマットに必ず従うこと
  - 誤字脱字がない場合は、空の配列を返すこと

  # 出力フォーマット
  ${schemaString}
  `;

  // Anthropic APIを呼び出す関数
  const caller = async (): Promise<Response> => {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 256,
      messages: [
        {
          role: 'assistant',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: input,
        },
      ],
    });
    // レスポンスのJSON→Zodスキーマの型に変換 失敗したらエラーをThrow
    const parsed = jsonStringSchema
      .pipe(responseSchema)
      .parse(response.content[0]?.text);

    return parsed;
  };

  // パースに失敗したらリトライする
  try {
    const result = await retryAsync(caller, {
      maxTry: 3,
      delay: 1000,
      onError: (e) => {
        if (e instanceof z.ZodError) {
          console.error(e.errors);
        } else {
          console.error(e);
        }
      },
    });

    result.forEach((r) => {
      console.log({
        修正前の文章: r.originalText,
        修正後の文章: r.fixedText,
        修正理由: r.reason,
      });
    });
  } catch (e) {
    if (isTooManyTries(e)) {
      console.error('リトライ回数が上限に達しました');
    } else {
      throw e;
    }
  }
};

const input = `
私5月11日にTSKaigiというTypeScriptのカンファレンスに参加しました。
TypeScriptに関するノウハウを得ることができ、とても有意義な時間を過ごすできました。
また、参加者の人々と交流することで、モチベーションが高めることができました。
`;

main(input);
