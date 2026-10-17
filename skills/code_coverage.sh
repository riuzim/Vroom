#!/usr/bin/env bash
set -euo pipefail

THRESHOLD=80

# Detect language and run tests with coverage
if [ -f package.json ]; then
    echo "Running jest with coverage…"
    if command -v yarn &>/dev/null; then
        yarn test --coverage || { echo "Coverage failed."; exit 1; }
    else
        npm test -- --coverage || { echo "Coverage failed."; exit 1; }
    fi
elif [ -f pyproject.toml ] || [ -f requirements.txt ]; then
    echo "Running pytest with coverage…"
    if command -v coverage &>/dev/null; then
        coverage run -m pytest && coverage report -m --fail-under $THRESHOLD || { echo "Coverage below $THRESHOLD%."; exit 1; }
    else
        echo "coverage tool not found. Install python 'coverage'."
        exit 1
    fi
elif [ -f go.mod ]; then
    echo "Running go test with coverage…"
    go test ./... -coverprofile=coverage.out || { echo "go test failed."; exit 1; }
    go tool cover -func=coverage.out | grep "total:" | awk '{print $3}' | tr -d '()%' | awk -v thr=$THRESHOLD '$1>=thr{exit 0} END{print "Coverage below "$thr"%"; exit 1}'
elif [ -f Cargo.toml ]; then
    echo "Running cargo test with coverage…"
    if ! command -v cargo-llvm-cov &>/dev/null; then
        echo "cargo-llvm-cov not installed. Install via cargo install cargo-llvm-cov"
        exit 1
    fi
    cargo llvm-cov --output-format term --fail-under $THRESHOLD
else
    echo "No supported language detected for coverage." >&2
    exit 1
fi

echo "Coverage satisfactory.""}