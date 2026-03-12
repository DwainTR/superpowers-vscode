# Superpowers for Copilot Chat

Bring [Superpowers skills](https://github.com/DwainTR/superpowers-copilot) to GitHub Copilot Chat in VS Code. A structured set of AI workflows for brainstorming, TDD, debugging, planning, code review, and more.

## Requirements

- VS Code >= 1.90.0
- [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) extension

## Usage

Invoke skills using the `@superpowers` chat participant with a slash command:

```
@superpowers /brainstorming  — Design a feature before writing code
@superpowers /tdd            — Implement with Test-Driven Development
@superpowers /debug          — Systematically debug unexpected behavior
@superpowers /plan           — Write a detailed implementation plan
@superpowers /verify         — Confirm work is done before claiming complete
```

Type `@superpowers` (no command) to see all available skills.

## Custom Skills

Add your own skills by placing `SKILL.md` files in `~/.copilot/skills/superpowers/` (or configure a custom path in settings). Custom skills are automatically detected without restarting VS Code.

Invoke custom skills with: `@superpowers custom <skill-name>`

## All Skills

| Slash Command | What It Does |
|---|---|
| `/brainstorming` | Collaborative design before implementation |
| `/tdd` | Test-Driven Development workflow |
| `/debug` | Systematic root-cause debugging |
| `/plan` | Implementation planning from a spec |
| `/execute` | Execute a written plan step by step |
| `/subagent` | Break work into parallel subagent tasks |
| `/parallel` | Dispatch independent tasks concurrently |
| `/review` | Pre-review code quality checklist |
| `/receive-review` | Process code review feedback rigorously |
| `/verify` | Verification before claiming complete |
| `/worktree` | Git worktree isolation for feature branches |
| `/finish` | Finish a branch — merge, PR, or cleanup |
| `/write-skill` | Create a new Superpowers skill |
| `/superpowers` | Learn how to use Superpowers effectively |

## Settings

| Setting | Default | Description |
|---|---|---|
| `superpowers.customSkillsPath` | `""` (uses `~/.copilot/skills/superpowers/`) | Custom skills directory |
| `superpowers.enableCustomSkills` | `true` | Enable/disable custom skill loading |

## Based On

Skills authored by [Jesse Vincent](https://github.com/jessevondoom). This extension packages them for native VS Code Copilot Chat use.

Source: [DwainTR/superpowers-copilot](https://github.com/DwainTR/superpowers-copilot)
