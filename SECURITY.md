# Security Policy

Atrium runs AI agents against your local project folders, so we take security seriously.

## Built-in safeguards

- Agents are denied access to `.env`, private keys (`*.pem`, `*.key`, `id_rsa*`, `id_ed25519*`) and shell tools (Bash, PowerShell).
- File changes are off by default and must be allowed per command.
- Agents are instructed never to commit, push, install packages or publish anything.
- Per-run and daily spending caps; a run whose cost cannot be read is counted at its full cap.
- An optional Anthropic API key is encrypted with your operating system's secure storage and never reaches the UI.
- Atrium reads Claude Code chat history **locally only**; nothing is uploaded anywhere.

## Reporting a vulnerability

Please email **security@cicibyte.com** (or info@cicibyte.com) with a description and steps to
reproduce. Do not open a public issue. We aim to reply within 72 hours.
