---
sidebar_position: 2
sidebar_label: Advanced Prompting
---

# Advanced Prompting

Once you're comfortable with the [basics](/prompting/basics), these techniques help you get more reliable and structured output for complex programming tasks.

## Chain-of-thought prompting

Ask the model to reason step by step before writing code. This reduces errors in complex logic.

```
Before writing the code, explain your approach:
1. What edge cases does this function need to handle?
2. What data structure is most appropriate?
3. What's the time complexity?

Then implement the function.
```

## Role prompting

Giving the model a role can improve the quality of output for specialised tasks:

```
You are a senior TypeScript engineer doing a code review.
Point out any type safety issues, missing error handling, and
performance concerns in the following code:
```

## Few-shot prompting

Provide multiple examples to establish a clear pattern before asking the model to continue it:

```
Translate these TypeScript errors to plain English:

TS2345: Argument of type 'string' is not assignable to parameter of type 'number'
→ You passed a text value where a number was expected.

TS2304: Cannot find name 'useState'
→ React's useState is not imported in this file.

TS7006: Parameter 'event' implicitly has an 'any' type
→ ?
```

## Ask for alternatives

When you're not sure about the best approach, ask for options:

```
Show me three ways to debounce a React input handler.
For each: show the code, list the pros and cons, and say when you'd use it.
```

## Constrain the output

Explicit constraints prevent the model from over-engineering:

```
Implement this in under 20 lines. No external libraries. No classes.
Use only the Web Crypto API that's available in modern browsers.
```

## Verify AI reasoning

For critical logic, ask the model to verify its own work:

```
Implement a function that determines if a year is a leap year.
Then write three test cases that would catch a wrong implementation,
and verify your function passes all of them.
```

## System prompts and persistent context

In tools that support system prompts (Claude, OpenAI API, etc.), use them to establish permanent context you don't want to repeat every time. See the [Tools Overview](/tools/overview) for which tools support this.

```
You are a TypeScript developer working on a Node.js API.
- Always use strict typing, no `any`
- Prefer functional patterns over classes
- Use Zod for runtime validation
- Return errors as Result<T, E> types, never throw
```
