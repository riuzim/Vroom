#!/usr/bin/env bash
set -euo pipefail

# Detect the project type and run the matching test runner

if [ -f package.json ]; then
    # Node.js / JavaScript / TypeScript
    if command -v yarn &>/dev/null; then
        yarn test
    else
        npm test
    fi
elif [ -f pyproject.toml ] || [ -f requirements.txt ]; then
    # Python
    if command -v poetry &>/dev/null && [ -f pyproject.toml ]; then
        poetry run pytest
    else
        pytest
    fi
elif [ -f go.mod ]; then
    # Go
    go test ./...
elif [ -f Cargo.toml ]; then
    # Rust
    cargo test
else
    echo "No supported test runner detected in the project root." >&2
    exit 1
fi
