import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { Skill, SkillMap } from './types';

const OUTPUT_CHANNEL_NAME = 'Superpowers';
let outputChannel: vscode.OutputChannel | undefined;

function log(message: string): void {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
  }
  outputChannel.appendLine(`[SkillLoader] ${message}`);
}

/** Parse a SKILL.md file. Returns null and logs a warning on failure. */
function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
     const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
     if (!match) { return { data: {}, content: raw }; }
     const data: Record<string, string> = {};
     for (const line of match[1].split('\n')) {
       const colonIdx = line.indexOf(':');
       if (colonIdx === -1) { continue; }
       const key = line.slice(0, colonIdx).trim();
       let value = line.slice(colonIdx + 1).trim();
       if (/^["']/.test(value) && value.length > 1) { value = value.slice(1, value.endsWith('"') || value.endsWith("'") ? -1 :
  value.length); }
       if (key) { data[key] = value; }
     }
     return { data, content: match[2].trim() };
   }

   function parseSkillFile(filePath: string, source: 'bundled' | 'custom'): Skill | null {
     let raw: string;
     try { raw = fs.readFileSync(filePath, 'utf-8'); } catch (e) {
       log(`WARNING: Could not read file ${filePath}: ${String(e)}`);
       return null;
     }
     const { data, content } = parseFrontmatter(raw);
     const { name, description } = data;
     if (!name || !description) {
       log(`WARNING: Missing required frontmatter (name, description) in ${filePath} — skipping`);
       return null;
     }
     return { name, description, content, source };
   }
/** Resolve the custom skills directory path (cross-platform). */
function resolveCustomPath(configuredPath: string): string {
  if (configuredPath && configuredPath !== '') {
    return configuredPath.replace(/^~/, os.homedir());
  }
  return path.join(os.homedir(), '.copilot', 'skills', 'superpowers');
}

/** Load all skills from a directory. Each sub-folder with a SKILL.md is a skill. */
function loadSkillsFromDir(dir: string, source: 'bundled' | 'custom'): Skill[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const skills: Skill[] = [];
  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch (e) {
    log(`WARNING: Could not read directory ${dir}: ${String(e)}`);
    return [];
  }

  for (const entry of entries) {
    const skillMdPath = path.join(dir, entry, 'SKILL.md');
    if (fs.existsSync(skillMdPath)) {
      const skill = parseSkillFile(skillMdPath, source);
      if (skill) {
        skills.push(skill);
      }
    }
  }

  return skills;
}

/** Load all skills: bundled first, then custom (custom overrides bundled on name collision). */
export function loadSkills(extensionUri: vscode.Uri): SkillMap {
  const skillMap: SkillMap = new Map();

  // 1. Bundled skills
  const bundledDir = vscode.Uri.joinPath(extensionUri, 'skills').fsPath;
  const bundled = loadSkillsFromDir(bundledDir, 'bundled');
  for (const skill of bundled) {
    skillMap.set(skill.name, skill);
  }
  log(`Loaded ${bundled.length} bundled skills from ${bundledDir}`);

  // 2. Custom skills (if enabled)
  const config = vscode.workspace.getConfiguration('superpowers');
  const enableCustom = config.get<boolean>('enableCustomSkills', true);
  if (!enableCustom) {
    return skillMap;
  }

  const configuredPath = config.get<string>('customSkillsPath', '');
  const customDir = resolveCustomPath(configuredPath);
  const custom = loadSkillsFromDir(customDir, 'custom');
  for (const skill of custom) {
    if (skillMap.has(skill.name)) {
      log(`INFO: Custom skill "${skill.name}" overrides bundled skill with same name`);
    }
    skillMap.set(skill.name, skill);
  }
  log(`Loaded ${custom.length} custom skills from ${customDir}`);

  return skillMap;
}

/** Get the resolved custom skills directory path based on current VS Code config. */
export function getCustomSkillsDir(): string {
  const config = vscode.workspace.getConfiguration('superpowers');
  const configuredPath = config.get<string>('customSkillsPath', '');
  return resolveCustomPath(configuredPath);
}
