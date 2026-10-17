#!/usr/bin/env bash
set -uo pipefail

# Format tracked files using whatever formatter is available on PATH

if command -v prettier &>/dev/null; then
    if git ls-files '*.js' '*.ts' '*.tsx' '*.jsx' '*.json' '*.css' '*.md' | grep -q .; then
        echo "Running Prettier..."
        git ls-files -z '*.js' '*.ts' '*.tsx' '*.jsx' '*.json' '*.css' '*.md' | xargs -0 -r prettier --write
    fi
fi

if command -v black &>/dev/null; then
    if git ls-files '*.py' | grep -q .; then
        echo "Running Black..."
        git ls-files -z '*.py' | xargs -0 -r black
    fi
fi

if command -v go &>/dev/null && [ -f go.mod ]; then
    echo "Running go fmt..."
    go fmt ./...
fi

if command -v cargo &>/dev/null && [ -f Cargo.toml ]; then
    echo "Running cargo fmt..."
    cargo fmt
fi

echo "Formatting completed."
