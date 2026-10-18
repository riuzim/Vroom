---
name: run-tests
description: >-
  Execute the project's test suite and fail the run if any test fails. Suitable for pre‑commit or CI.
---

## Usage

```
bash skills/run_tests.sh
```

The script detects the language and runs the appropriate test runner. If nothing matches, it exits with an informative error.
