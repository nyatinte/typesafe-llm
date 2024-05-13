import { openAI } from '../client/openai';

const main = async () => {
  const systemPrompt = `あなたは校閲です。入力された文章の誤字脱字を修正してください。`;
  const inputPromptPrefix = `# 入力`;
  const input = `
私5月11日にTSKaigiというTypeScriptのカンファレンスに参加しました。
TypeScriptに関するノウハウを得ることができ、とても有意義な時間を過ごすできました。
また、参加者の人々と交流することで、モチベーションが高めることができました。
`;

  const outputFormatPromptPrefix = `# 出力フォーマット`;
  const outputFormat = `
{
  originalText: string; // 元の文章 (問題のある箇所をピンポイントで抽出すること)
  fixedText: string; // 誤字脱字を修正した文章
  reason: string; // 修正理由
}[]
`;

  const userPrompt = [
    inputPromptPrefix,
    input,
    outputFormatPromptPrefix,
    outputFormat,
  ].join('\n');

  const response = await openAI.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const result = JSON.parse(response.choices[0]?.message.content as string) as {
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

await main();
