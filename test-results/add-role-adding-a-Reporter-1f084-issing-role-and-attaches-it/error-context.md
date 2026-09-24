# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: add-role.spec.ts >> adding a Reporter role >> offers the missing role and attaches it
- Location: tests\e2e\add-role.spec.ts:6:7

# Error details

```
Error: locator.fill: Target page, context or browser has been closed
Call log:
  - waiting for getByLabel('Phone number')

```

```
Error: browserContext.close: Target page, context or browser has been closed
```