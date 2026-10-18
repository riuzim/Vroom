---
name: code-coverage
description: >-
  Run the test suite with a coverage tool and fail if coverage drops below a configured threshold.
---

## Usage

```
bash skills/code_coverage.sh
```

The script runs test runners that support coverage (e.g., jest, pytest, rustc, go), collects the result, and exits with an error if the overall percentage is below 80%.
