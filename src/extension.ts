import * as vscode from 'vscode';
import { loadSkills } from './skillLoader';
import { registerParticipant } from './participant';
import { startWatcher } from './watcher';
import { SkillMap } from './types';

export function activate(context: vscode.ExtensionContext): void {
  // Load skills on activation
  let skills: SkillMap = loadSkills(context.extensionUri);

  // Track current participant separately to avoid subscription list growth on reload
  let currentParticipant: vscode.Disposable = registerParticipant(context, skills);

  // Watch for custom skill changes and reload without accumulating subscriptions
  const config = vscode.workspace.getConfiguration('superpowers');
  const enableCustom = config.get<boolean>('enableCustomSkills', true);

  if (enableCustom) {
    const watcherDisposable = startWatcher(context, () => {
      skills = loadSkills(context.extensionUri);
      currentParticipant.dispose();
      currentParticipant = registerParticipant(context, skills);
    });
    context.subscriptions.push(watcherDisposable);
  }

  // Register initial participant for cleanup on extension deactivate
  context.subscriptions.push({ dispose: () => currentParticipant.dispose() });
}

export function deactivate(): void {
  // VS Code handles cleanup via context.subscriptions
}
