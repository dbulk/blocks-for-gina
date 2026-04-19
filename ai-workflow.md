# AI Execution Workflow

Follow these steps when actioning a backlog item.

## Branch
- Pick one backlog tag and create a branch named `feat/<tag-without-hash>` (example: `#mode-aware-hud` → `feat/mode-aware-hud`).

## Plan
- Read the matching plan file (`plans/plan-<tag-without-hash>.md`) and expand it into concrete implementation steps before coding.
- Commit the expanded plan as the **first commit** on the branch.
- Plan files are branch-scoped working documents and must **never land on main**.

## Implement
- Implement in small increments with short one-line commits.
- Keep changes scoped to the selected backlog item; if scope shifts, update related backlog and plan files in the same branch.

## PR
- Before opening the PR, delete the plan file and commit the removal:
  ```sh
  git rm plans/plan-<tag-without-hash>.md
  git commit -m "remove plan file"
  ```
- Push the branch and open a PR using a body file to avoid literal `\n`:
  ```sh
  # Write body content to a temp file, then:
  gh pr create --base main --head feat/<tag> --title "<title>" --body-file /tmp/pr-body.md
  rm /tmp/pr-body.md
  ```
- In the PR body, include: summary of changes, commit list, test/build evidence, and any follow-up items.

## Review & Merge
- Require human review before merge; do not self-merge.
- After merge, remove the completed item from `backlog.md` and adjust remaining items/plans as needed.
