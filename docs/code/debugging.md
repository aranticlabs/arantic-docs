---
sidebar_position: 2
---

# Debugging with AI

AI makes a strong debugging partner: it can spot patterns in errors quickly and suggest hypotheses you might not consider. The key is giving it enough context.

## Give the full picture

A bug report without context produces a generic answer. Include:

1. **The error message**: exact text, including the stack trace
2. **The code**: the function or component where the error originates
3. **What you expected**: the intended behaviour
4. **What actually happened**: the actual behaviour
5. **What you've already tried**: so it doesn't repeat dead ends

```
I'm getting this error in production:

TypeError: Cannot read properties of undefined (reading 'id')
  at getUserLabel (utils/user.ts:14:22)
  at UserCard.render (components/UserCard.tsx:38:10)

Here's the relevant code:

[paste code]

The function is called when rendering a list of users fetched from /api/users.
I expected it to render each user's name. Instead, the page crashes.
I've already checked that the API returns data - the network tab shows a 200 with a valid array.
```

## Rubber duck debugging with AI

Explain the bug out loud to the model, even if you don't have a specific question. Often the act of articulating the problem reveals the answer, and if it doesn't, the model can ask clarifying questions.

## Hypothesis-driven debugging

Ask the model to list possible causes ranked by likelihood:

```
My API endpoint intermittently returns 500 errors under load, but never
in local development. What are the most likely causes? Rank them.
```

Then work through each hypothesis systematically.

## Reading unfamiliar errors

Paste the error and ask for a plain-English explanation:

```
What does this TypeScript error mean, and what's the most common cause?

Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
```

## Debugging async and race conditions

Async bugs are hard to spot. Describe the sequence of events:

```
I have two async operations that run in parallel with Promise.all().
Sometimes the second one fails with a "connection already closed" error.
Here's the code: [paste]

Could there be a race condition here? What should I look for?
```

## Narrowing down the problem

If you're not sure where the bug is, ask the model to help you add targeted logging or write a minimal reproduction:

```
I suspect the bug is somewhere in this data transformation pipeline.
What console.log statements would you add to isolate exactly where the
value changes from what I expect?
```
