import * as vscode from 'vscode';
import { SkillMap } from './types';

const PARTICIPANT_ID = 'dwaintr.superpowers';

/** Build the help message listing all available skills. */
function buildHelpMessage(skills: SkillMap): string {
  const lines = [
    '## 🦁 Superpowers for Copilot Chat\n',
    'Available skills:\n',
  ];
  for (const [, skill] of skills) {
    const tag = skill.source === 'custom' ? ' *(custom)*' : '';
    lines.push(`- **/${skill.name}**${tag} — ${skill.description}`);
  }
  lines.push('\n*Use `@superpowers /skill-name` to invoke a skill.*');
  lines.push('*For custom skills not listed above: `@superpowers custom <skill-name>`*');
  return lines.join('\n');
}

/** Create and register the @superpowers chat participant. Returns disposable. */
export function registerParticipant(
  context: vscode.ExtensionContext,
  skills: SkillMap
): vscode.Disposable {
  const participant = vscode.chat.createChatParticipant(PARTICIPANT_ID, async (
    request: vscode.ChatRequest,
    _chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<vscode.ChatResult> => {

    // Resolve which skill to use
    let skill = request.command ? skills.get(request.command) : undefined;

    // Handle "custom <skill-name>" text pattern for non-slash custom skills
    if (!skill && request.prompt.startsWith('custom ')) {
      const customName = request.prompt.slice('custom '.length).trim().split(/\s/)[0];
      skill = skills.get(customName);
      if (!skill) {
        stream.markdown(`❌ Custom skill **"${customName}"** not found.\n\nUse \`@superpowers\` to list available skills.`);
        return {};
      }
    }

    // No command and no "custom" prefix → show help
    if (!skill) {
      stream.markdown(buildHelpMessage(skills));
      return {};
    }

    // Select language model
    let model: vscode.LanguageModelChat;
    try {
      const models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
      if (!models.length) {
        stream.markdown('❌ No Copilot language model available. Make sure GitHub Copilot Chat is installed and signed in.');
        return {};
      }
      model = models[0];
    } catch (e) {
      stream.markdown(`❌ Failed to access language model: ${String(e)}`);
      return {};
    }

    // Build prompt: skill instructions + user's message
    const userMessage = request.command
      ? request.prompt
      : request.prompt.replace(/^custom \S+\s*/, '');

    const fullPrompt = `[SKILL INSTRUCTIONS — follow this process for the conversation]\n\n${skill.content}\n\n---\n\n${userMessage || `I'd like to use the ${skill.name} skill.`}`;

    const messages = [
      vscode.LanguageModelChatMessage.User(fullPrompt)
    ];

    // Stream model response
    try {
      const response = await model.sendRequest(messages, {}, token);
      for await (const chunk of response.stream) {
        if (chunk instanceof vscode.LanguageModelTextPart) {
          stream.markdown(chunk.value);
        }
      }
    } catch (e) {
      if (!token.isCancellationRequested) {
        stream.markdown(`❌ Error communicating with Copilot: ${String(e)}`);
      }
    }

    return {};
  });

  participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'images', 'icon.png');

  return participant;
}
