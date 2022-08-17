import {
  DecorationOptions,
  ExtensionContext,
  MarkdownString,
  Range,
  TextEditor,
  window,
  workspace,
} from "vscode";
import * as decorations from "./config/decorations";
import { getContractSymbol } from "./utils/getContractSymbol";

import { toChecksumAddress } from "./utils/toChecksumAddress";

const ethGlobalRegExp = /(0x[a-fA-F0-9]{40})[\W\D\n]/g;
const ethSingleLineRegExp = /(0x[a-fA-F0-9]{40})[\W\D\n\s$]*/;

let detailsDecoration: TextEditorDecorationType | null = null;

export function activate(context: ExtensionContext) {
  // Decorate all visible editors on startup
  if (window.visibleTextEditors.length > 0) {
    window.visibleTextEditors.forEach((editor) => {
      decorate(editor);
    });
  }

  // Listener to decorate active editor on change
  window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      decorate(editor);
    }
  });

  // Redecorate if an Editor is saved
  workspace.onWillSaveTextDocument((event) => {
    if (window.activeTextEditor) {
      decorate(window.activeTextEditor);
    }
  });

  window.onDidChangeTextEditorSelection((event) => {
    // Always dispose previous decoration if available
    if (detailsDecoration) {
      detailsDecoration.dispose();
    }

    const [selection] = event.selections;
    // Do nothing if multiple lines are selected
    if (!selection.isSingleLine) {
      return;
    }

    const lineText = event.textEditor.document.lineAt(
      selection.start.line
    ).text;

    let match;
    if ((match = ethSingleLineRegExp.exec(lineText))) {
      getContractSymbol(match[1]).then((name) => {
        if (!name) {
          return;
        }
        const range = new Range(selection.start, selection.end);

        detailsDecoration = window.createTextEditorDecorationType({
          isWholeLine: true,
          after: {
            color: "#5d5d55",
            contentText: `\t| ${name}`,
          },
        });

        event.textEditor.setDecorations(detailsDecoration, [
          {
            range,
          },
        ]);
      });
    }
  });
}

function decorate(editor: TextEditor) {
  const sourceCode = editor.document.getText();

  let validChecksumAddresses: DecorationOptions[] = [];
  let invalidChecksumAddresses: DecorationOptions[] = [];
  let lowercaseAddresses: DecorationOptions[] = [];

  let match;

  while ((match = ethGlobalRegExp.exec(sourceCode))) {
    const matchedAddress = match[1];
    const startPos = editor.document.positionAt(match.index);
    const endPos = editor.document.positionAt(
      match.index + matchedAddress.length
    );
    const range = new Range(startPos, endPos);
    const checksumAddress = toChecksumAddress(matchedAddress);
    const hoverMessage = new MarkdownString();
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
