---
name: full-commit
description: >-
  Commit all tracked changes in the repository using a short message. Only local changes are affected; the repository must be clean or at least not have untracked ignored files.
---

## Usage

```
bash skills/full_commit.sh
```

The script stages every change (`git add -A`) and creates a single
commit with the message **"Committing all changes"**.
