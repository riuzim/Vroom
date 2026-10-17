#!/usr/bin/env bash
set -euo pipefail

# Detect package manager and run audit

if [ -f package.json ]; then
    echo "Running npm audit…"
    npm audit --prod > /dev/null || { echo "Vulnerabilities found in npm dependencies."; exit 1; }
elif [ -f Pipfile ]; then
    echo "Running pipenv check…"
    pipenv check > /dev/null || { echo "Vulnerabilities found in pipenv dependencies."; exit 1; }
elif [ -f requirements.txt ]; then
    echo "Running pip‑check…"
    pip install pip‑check &>/dev/null || true
    pip check > /dev/null || { echo "Vulnerabilities found in pip dependencies."; exit 1; }
elif [ -f Gemfile ]; then
    echo "Running bundle audit…"
    bundle audit --quiet > /dev/null || { echo "Vulnerabilities found in bundler dependencies."; exit 1; }
elif [ -f Cargo.toml ]; then
    echo "Running cargo audit…"
    cargo audit > /dev/null || { echo "Vulnerabilities found in Rust dependencies."; exit 1; }
else
    echo "Nenhum gerenciador de pacotes suportado detectado." >&2
    exit 1
fi

echo "No known vulnerabilities detected by audit."