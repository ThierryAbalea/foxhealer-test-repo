# FoxHealer Test Repository

This repository exists to exercise the FoxHealer GitHub App end-to-end.

## What is FoxHealer?

FoxHealer is an AI-powered fixer for failing CI.

When GitHub Actions fails on a PR:
- FixFox spins a Daytona sandbox
- Re-runs the tests to reproduce the error
- Uses OpenAI Codex to generate a patch
- Commits the fix back to the PR

A fully automated "self-healing CI" pipeline in one GitHub App.
