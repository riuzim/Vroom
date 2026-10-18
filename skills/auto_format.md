---
name: auto-format
description: >-
  Apply the project’s preferred code formatter to all files. Applies formatting only to tracked files and does not modify ignored patterns.
---

## Usage

```
bash skills/auto_format.sh
```

The script detects the available formatter (Prettier for JS/TS, Black for Python, go fmt for Go, rustfmt for Rust) and runs it on the repository.
