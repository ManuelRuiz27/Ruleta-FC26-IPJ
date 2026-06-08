# Fix Scoped Task

Use this workflow for narrow bug fixes.

## Instructions

1. Read only the files explicitly listed by the user.
2. Do not inspect the whole repository unless requested.
3. Do not modify unrelated files.
4. Identify the smallest code change that satisfies the task.
5. Keep existing architecture.
6. Run `npm run build`.
7. If build fails, fix TypeScript/build errors before finishing.

## Final response required

- Files modified
- Exact changes made
- Build result
- Remaining risks
