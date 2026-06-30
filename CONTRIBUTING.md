# Contributing to BHULink

Thanks for contributing to BHULink. This guide keeps contributions consistent, reviewable, and safe.

## Development Setup

1. Fork and clone the repository.
2. Install dependencies:
   - `npm install`
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
3. Configure local environment variables from `.env.example`.
4. Run backend and frontend in separate terminals.

## Branch Naming

Use descriptive branch names:

- `feature/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `refactor/<short-description>`

Examples:
- `feature/group-chat-search`
- `fix/login-validation`

## Commit Guidelines

Write clear commit messages in imperative mood:

- `feat: add unread message badge`
- `fix: prevent null profile image crash`
- `docs: improve setup instructions`

Keep commits focused. Avoid combining unrelated changes in one commit.

## Pull Request Checklist

Before opening a PR, verify:

- [ ] Code builds and runs locally
- [ ] No secrets or `.env` files are committed
- [ ] Related documentation is updated
- [ ] UI changes include screenshots if relevant
- [ ] PR description explains what changed and why

## Coding Expectations

- Follow existing style and file structure
- Prefer readable code over clever code
- Keep components/functions focused and small
- Add comments only where logic is not obvious

## Issue Reporting

When opening a bug report, include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, browser)
- Screenshots/logs when useful

## Security

If you discover a security issue, do not publish credentials or sensitive details in public issues.
