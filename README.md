# FoxHealer Test Repository
...
This repository exists to exercise the FoxHealer GitHub App end-to-end.

It contains a tiny TypeScript domain with a few pieces of business logic (pricing, restocking, and fulfillment) plus Vitest coverage so you can deliberately break behavior and watch FoxHealer repair the regression.

## What is FoxHealer?

FoxHealer is an AI-powered fixer for failing CI.

When GitHub Actions fails on a PR:
- FixFox spins a Daytona sandbox
- Re-runs the tests to reproduce the error
- Uses OpenAI Codex to generate a patch
- Commits the fix back to the PR

A fully automated "self-healing CI" pipeline in one GitHub App.

## Local development

```bash
npm install
npm test
```

<!-- trigger 6 -->

<!-- trigger 7 -->

<!-- trigger 8 -->

<!-- trigger 9 -->

<!-- trigger 10 -->

<!-- trigger 11 -->
