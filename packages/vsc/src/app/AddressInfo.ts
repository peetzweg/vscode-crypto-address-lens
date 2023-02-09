import * as vscode from "vscode";
import { ETH_ADDRESS } from "./config/codes";
import { FIX_COMMAND } from "./config/commands";

export class AddressInfo implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    // for each diagnostic entry that has the matching `code`, create a code action command
    return context.diagnostics
      .filter((diagnostic) => diagnostic.code === ETH_ADDRESS)
      .map((diagnostic) => this.createCommandCodeAction(diagnostic));
  }

  private createCommandCodeAction(
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      "Learn more...",
      vscode.CodeActionKind.QuickFix
    );
    action.command = {
      command: FIX_COMMAND,
      title: "Learn more about emojis",
      tooltip: "This will open the unicode emoji page.",
    };
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    return action;
  }
}
