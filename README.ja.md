[English](README.md) | 日本語

Speaker Deck: <https://speakerdeck.com/nyatinte/llmwoxing-an-quan-nishi-utips>

# 型安全にLLMを使うためのTips

このリポジトリでは、TypeScriptを使ってLLMを型安全に利用するためのTipsを紹介しています。
LLMは外界からのレスポンスであり、常に望む値が返ってくるとは限りません。そこで、型安全に開発するための方法をレベル別に解説します。

## サンプルタスク

このリポジトリでは、以下のようなタスクを想定しています。

「LLMを利用した日本語添削ツール」

入力された文章の誤字脱字を抽出し、修正した文章と修正理由を出力するツールを開発します。
添削結果は以下のような型に変換することを目指します。

```typescript
{ originalText: string; fixedText: string; reason: string; }[]
```

## Level 1 - 特に工夫のないやり方 (level/1main.ts)

Level 1では、OpenAIのgpt-4-turboモデルを使用し、システムの振る舞い、入力、出力フォーマットを含めたプロンプトを投げ、レスポンスをJSONでパースして型をつけています。

しかし、このコードには以下の問題があります。

1. 値を検証せずに型変換している
2. プロンプトで指定している型とレスポンスの型が独立している

そのため、ランタイムエラーのリスクや、出力フォーマットとレスポンスの型の不一致といった問題を抱えています。

## Level 2 - TypeChatを使った方法 (level2/main.ts)

Level 2では、TypeChatというライブラリを使用しています。TypeChatは自然言語を型を満たすように変換するのに便利なライブラリで、内部でzodによる検証、リトライ、プロンプトの最適化などを行っています。

ただし、TypeChatには以下の課題があります。

- 日本語の文章を受け取り、校閲し、型に変換するようなタスクには向いていない
- OpenAIとAzure OpenAIのサポートはあるが、他のLLMのサポートは微妙

そのため、このサンプルではTypeChatを使用していますが、実際のユースケースには適していない可能性があります。

## Level 3 - 理想的な方法 (level3/{anthropic.ts, openai.ts})

Level 3では、以下の要件を満たす方法を紹介しています。

1. zodなどを使ったレスポンスの検証
2. リトライ機構の実装（ts-retryの利用、ミドルウェアによる柔軟なリトライ条件の定義など）
3. zod-to-tsを使ったレスポンスの型とプロンプトの出力フォーマットの一致
4. 特定のLLMに依存しない柔軟性（OpenAI SDK, Anthropic SDK, fetchなどを使い分け）

これらの手法を組み合わせることで、型安全かつ柔軟にLLMを活用したアプリケーション開発が可能になります。

## 使い方

```bash
cp .env.example .env
```

`.env`ファイルにAPIキーを設定してください。

```bash
pnpm run level1
pnpm run level2
pnpm run level3:openai
pnpm run level3:anthropic
```

ぜひ、このリポジトリを参考に、型安全にLLMを活用したアプリケーション開発にチャレンジしてみてください！
