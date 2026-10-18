---
name: lint-file
description: >-
  Lint all code files in the repository to ensure style and quality compliance before commit.
---

## Usage

```
bash skills/lint_file.sh
```

The script runs the appropriate linter(s) (ESLint for JavaScript/TypeScript, Flake8 for Python, RuboCop for Ruby, etc.) on the entire repo and exits with a non‑zero status if any lint errors are found, which can be used in pre‑commit hooks or CI.

_Adjust the linter installation and configuration as needed for your project._
