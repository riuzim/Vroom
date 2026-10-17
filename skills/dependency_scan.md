---
name: dependency-scan
description: >-
  Inspect the repository's dependencies for known vulnerabilities, using available package audit tools.
---

## Usage
```
bash skills/dependency_scan.sh
```

The script detects the package manager (npm, pip, bundler, etc.) and runs the appropriate audit command. Exits with a non‑zero status if any vulnerabilities are found.
