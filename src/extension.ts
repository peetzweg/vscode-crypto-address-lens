import * as vscode from "vscode";
import * as decorations from "./decorations";

import { toChecksumAddress } from "./toChecksumAddress";

const ethGlobalRegExp = /(0x[a-fA-F0-9]{40})[\W\D]/g;

export function activate(context: vscode.ExtensionContext) {
  vscode.workspace.onWillSaveTextDocument((event) => {
    const openEditor = vscode.window.visibleTextEditors.filter((editor) => {
      return editor.document.uri === event.document.uri;
    })[0];
    decorate(openEditor);
  });
}

function decorate(editor: vscode.TextEditor) {
  const sourceCode = editor.document.getText();

  let validChecksumAddresses: vscode.DecorationOptions[] = [];
  let invalidChecksumAddresses: vscode.DecorationOptions[] = [];
  let lowercaseAddresses: vscode.DecorationOptions[] = [];

  let match;

  while ((match = ethGlobalRegExp.exec(sourceCode))) {
    const matchedAddress = match[1];
    const startPos = editor.document.positionAt(match.index);
    const endPos = editor.document.positionAt(
      match.index + matchedAddress.length
    );
    const range = new vscode.Range(startPos, endPos);
    const checksumAddress = toChecksumAddress(matchedAddress);
    const hoverMessage = new vscode.MarkdownString();
    const explorerMarkdown = [
      `[Etherscan](https://etherscan.io/address/${checksumAddress})`,
      `[Polygonscan](https://polygonscan.com/address/${checksumAddress})`,
      `[Bscscan](https://bscscan.com/address/${checksumAddress})`,
    ].join(" | ");

    if (matchedAddress === checksumAddress) {
      hoverMessage.appendText("Address checksum is valid.\n");
      hoverMessage.appendMarkdown(explorerMarkdown);
      validChecksumAddresses.push({
        range,
        hoverMessage,
      });
    } else if (matchedAddress === matchedAddress.toLowerCase()) {
      hoverMessage.appendText("Address is not using checksum.\n");
      hoverMessage.appendMarkdown(explorerMarkdown);
      lowercaseAddresses.push({
        range,
        hoverMessage,
      });
    } else {
      hoverMessage.appendText("Address has an invalid checksum!\n");
      hoverMessage.appendMarkdown(explorerMarkdown);
      invalidChecksumAddresses.push({
        range,
        hoverMessage,
      });
    }
  }

  editor.setDecorations(decorations.validChecksum, validChecksumAddresses);
  editor.setDecorations(decorations.lowercase, lowercaseAddresses);
  editor.setDecorations(decorations.invalidChecksum, invalidChecksumAddresses);
}
