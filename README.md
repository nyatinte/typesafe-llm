English | [日本語](README.ja.md)

Speaker Deck: <https://speakerdeck.com/nyatinte/llmwoxing-an-quan-nishi-utips>

# Tips for Using LLMs in a Type-Safe

This repository introduces tips for using LLMs in a type-safe manner with TypeScript.
LLMs are responses from the external world and may not always return the desired values. Therefore, we will explain methods for type-safe development at different levels.

## Sample Task

In this repository, we assume the following task:

"A Japanese proofreading tool using LLMs"

We will develop a tool that extracts typos from the input text, and outputs the corrected text along with the reason for correction.
The goal is to convert the proofreading results into the following type:

```typescript
{ originalText: string; fixedText: string; reason: string; }[]
```

## Level 1 - A simple approach without any special techniques (level1/main.ts)

In Level 1, we use OpenAI's gpt-4-turbo model, send a prompt including the system behavior, input, and output format, parse the response with JSON, and assign types.

However, this code has the following problems:

1. Type conversion is performed without validating the values
2. The type specified in the prompt and the type of the response are independent

Therefore, it has risks of runtime errors and inconsistencies between the output format and the response type.

## Level 2 - Using TypeChat (level2/main.ts)

In Level 2, we use a library called TypeChat. TypeChat is a convenient library for converting natural language to match types, and internally performs validation with zod, retries, prompt optimization, etc.

However, TypeChat has the following challenges:

- It is not suitable for tasks such as receiving Japanese text, proofreading it, and converting it to a type
- It supports OpenAI and Azure OpenAI, but support for other LLMs is questionable

Therefore, although we use TypeChat in this sample, it may not be suitable for actual use cases.

## Level 3 - An ideal approach (level3/{anthropic.ts, openai.ts})

In Level 3, we introduce a method that satisfies the following requirements:

1. Response validation using zod, etc.
2. Implementation of retry mechanism (using ts-retry, defining flexible retry conditions with middleware, etc.)
3. Matching the response type with the output format of the prompt using zod-to-ts
4. Flexibility independent of specific LLMs (using OpenAI SDK, Anthropic SDK, fetch, etc., as appropriate)

By combining these techniques, it becomes possible to develop applications that utilize LLMs in a type-safe and flexible manner.

## Usage

```bash
cp .env.example .env
```

Set the API keys in the `.env` file.

```bash
pnpm run level1
pnpm run level2
pnpm run level3:openai
pnpm run level3:anthropic
```

Please refer to this repository and take on the challenge of developing applications that utilize LLMs in a type-safe manner!
