#!/usr/bin/env bash
set -uo pipefail

# Run every linter available on PATH and fail if any of them reports errors

FAILED=0
RAN_ANY=0

if command -v flake8 &>/dev/null; then
    echo "Running Flake8 (Python)..."
    RAN_ANY=1
    flake8 . || FAILED=1
fi

if [ -x node_modules/.bin/eslint ] || command -v eslint &>/dev/null; then
    echo "Running ESLint (JS/TS)..."
    RAN_ANY=1
    if [ -x node_modules/.bin/eslint ]; then
        node_modules/.bin/eslint . || FAILED=1
    else
        eslint . || FAILED=1
    fi
fi

if command -v rubocop &>/dev/null; then
    echo "Running RuboCop (Ruby)..."
    RAN_ANY=1
    rubocop || FAILED=1
fi

if [ "$RAN_ANY" -eq 0 ]; then
    echo "No supported linter found in PATH." >&2
    exit 1
fi

if [ "$FAILED" -ne 0 ]; then
    echo "Lint errors found." >&2
    exit 1
fi

echo "Lint finished - no errors found."
