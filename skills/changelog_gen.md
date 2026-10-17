---
name: changelog-gen
description: >-
  Generate or update CHANGELOG.md based on commit messages that follow a conventional format.
---

## Usage
```
bash skills/changelog_gen.sh
```

The script reads commit logs, extracts titles, and writes them into a changelog file. Exits with a non‑zero status if the changelog couldn't be updated.
