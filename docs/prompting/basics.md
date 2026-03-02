---
sidebar_position: 1
---

# Prompting Basics

The quality of AI output depends almost entirely on the quality of your prompt. A vague question gets a vague answer. A precise, contextual prompt gets something you can actually use.

## Be specific about what you want

Avoid open-ended requests. The more constraints you give, the more useful the output.

**Weak:**
```
Write a function to parse dates.
```

**Strong:**
```
Write a TypeScript function that parses date strings in the formats
"YYYY-MM-DD" and "DD.MM.YYYY" and returns a Date object. Throw a
TypeError if the input doesn't match either format.
```

## Provide context

AI models don't know your codebase. Give them the relevant pieces:

- The language and framework you're using
- Existing interfaces or types the output must conform to
- Any constraints (performance, bundle size, no external dependencies)

```
I'm using React 19 with TypeScript. I have this existing hook:

[paste your hook here]

Add a reset() method that restores all state to its initial values.
```

## Specify the output format

Tell the model exactly what you want back:

- "Return only the function, no explanation"
- "Show the diff, not the full file"
- "Give me three alternatives with trade-offs explained"

## Use examples

Examples are one of the most reliable ways to shape output. Show the model a sample input and the expected output:

```
Convert these function names to snake_case:

getUserById → get_user_by_id
fetchAllProducts → fetch_all_products
parseISODate → ?
```

## Iterate, don't restart

If the first response isn't right, refine it in the same conversation. The model retains context from your previous messages, so use it:

- "That's correct, but use `const` instead of `let`"
- "Avoid the `any` type; use the `User` interface I showed above"
- "Rewrite the error handling using a Result type instead of try/catch"
