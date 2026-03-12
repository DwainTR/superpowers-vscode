export interface Skill {
  /** Slash command name, e.g. "brainstorming" */
  name: string;
  /** Short description shown in command palette */
  description: string;
  /** Full SKILL.md content (without frontmatter) */
  content: string;
  /** Whether this skill came from the extension bundle or user's local directory */
  source: 'bundled' | 'custom';
}

/** Map of skill name → Skill, for fast lookup */
export type SkillMap = Map<string, Skill>;
