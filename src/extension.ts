import * as vscode from "vscode";
import { toChecksumAddress } from "./toChecksumAddress";

const checksumDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#6c71c455",
});

const lowercaseDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#258bd255",
});

const uppercaseDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#2aa19855",
});

const invalidChecksumDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#d2368255",
});

const ethRegExp = /(0x[a-fA-F0-9]{40})/;

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
  const sourceCodeArr = sourceCode.split("\n");

  let checksumAddresses: vscode.DecorationOptions[] = [];
  let invalidChecksumAddresses: vscode.DecorationOptions[] = [];
  let lowercaseAddresses: vscode.DecorationOptions[] = [];
  let uppercaseAddresses: vscode.DecorationOptions[] = [];

  for (let line = 0; line < sourceCodeArr.length; line++) {
    let match = sourceCodeArr[line].match(ethRegExp);

    if (match !== null && match.index !== undefined) {
      const matchedAddress = match[1];
      let range = new vscode.Range(
        new vscode.Position(line, match.index),
        new vscode.Position(line, match.index + matchedAddress.length)
      );

      const checksumAddress = toChecksumAddress(matchedAddress);
      const hoverMessage = new vscode.MarkdownString();
      hoverMessage.appendMarkdown(
        `[Open on Etherscan](https://etherscan.io/address/${checksumAddress})`
      );

      if (matchedAddress === checksumAddress) {
        hoverMessage.appendText("\nAddress checksum is valid.");
        checksumAddresses.push({
          range,
          hoverMessage,
        });
      } else if (matchedAddress === matchedAddress.toLowerCase()) {
        hoverMessage.appendText("\nAddress is not using checksum.");
        lowercaseAddresses.push({
          range,
          hoverMessage,
        });
      } else if (matchedAddress === matchedAddress.toUpperCase()) {
        hoverMessage.appendText("\nAddress is not using checksum.");
        uppercaseAddresses.push({
          range,
          hoverMessage,
        });
      } else {
        hoverMessage.appendText("\nAddress has an invalid checksum!");
        invalidChecksumAddresses.push({
          range,
          hoverMessage,
        });
      }
    }
  }

  editor.setDecorations(checksumDecoration, checksumAddresses);
  editor.setDecorations(lowercaseDecoration, lowercaseAddresses);
  editor.setDecorations(uppercaseDecoration, uppercaseAddresses);
  editor.setDecorations(invalidChecksumDecoration, invalidChecksumAddresses);
}
