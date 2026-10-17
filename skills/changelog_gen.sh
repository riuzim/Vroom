#!/usr/bin/env bash
set -euo pipefail

CHANGELOG=CHANGELOG.md
if [ ! -f "$CHANGELOG" ]; then
    echo "# Changelog" > "$CHANGELOG"
fi

LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -z "$LAST_TAG" ]; then
    LOG=$(git log --pretty=format:"- %s (%h)")
else
    LOG=$(git log "${LAST_TAG}..HEAD" --pretty=format:"- %s (%h)")
fi

if [ -z "$LOG" ]; then
    echo "No new commits to add to changelog."
    exit 0
fi

echo "## $(date +%Y-%m-%d)" >> "$CHANGELOG"
echo "$LOG" >> "$CHANGELOG"
echo "Changelog updated."