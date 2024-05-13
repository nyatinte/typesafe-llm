import { openAI } from '../client/openai';

const main = async (input: string) => {
  const systemPrompt = `
あなたは校閲です。入力された文章の誤字脱字を修正してください。

# 要件
- 細かい誤字脱字も指摘すること
- JSONで出力し、以下の出力フォーマットに必ず従うこと
- 誤字脱字がない場合は、空の配列を返すこと

# 出力フォーマット
{
  originalText: string; // 元の文章 (問題のある箇所をピンポイントで抽出すること)
  fixedText: string; // 誤字脱字を修正した文章
  reason: string; // 修正理由
}
`;

  const response = await openAI.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: input,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (!content) {
    throw new Error('OpenAIからのレスポンスが不正です');
  }
  const result = JSON.parse(content) as {
    originalText: string;
    fixedText: string;
    reason: string;
  }[];

  result.forEach((r) => {
    console.log({
      修正前の文章: r.originalText,
      修正後の文章: r.fixedText,
      修正理由: r.reason,
    });
  });
};

const input = `
私5月11日にTSKaigiというTypeScriptのカンファレンスに参加しました。
TypeScriptに関するノウハウを得ることができ、とても有意義な時間を過ごすできました。
また、参加者の人々と交流することで、モチベーションが高めることができました。
`;
main(input);
