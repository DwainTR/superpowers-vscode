import * as vscode from 'vscode';
import { getCustomSkillsDir } from './skillLoader';

/** Start watching the custom skills directory for changes.
 *  Calls onReload whenever a SKILL.md is added, changed, or deleted.
 *  Returns a Disposable to stop watching. */
export function startWatcher(
  context: vscode.ExtensionContext,
  onReload: () => void
): vscode.Disposable {
  const customDir = getCustomSkillsDir();
  const pattern = new vscode.RelativePattern(vscode.Uri.file(customDir), '**/SKILL.md');
  const watcher = vscode.workspace.createFileSystemWatcher(pattern);

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const triggerReload = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(onReload, 500);
  };

  watcher.onDidCreate(triggerReload, null, context.subscriptions);
  watcher.onDidChange(triggerReload, null, context.subscriptions);
  watcher.onDidDelete(triggerReload, null, context.subscriptions);

  return watcher;
}
