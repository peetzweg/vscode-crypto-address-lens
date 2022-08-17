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
import { RPCClient } from "./RPCClient";

import { toChecksumAddress } from "./utils/toChecksumAddress";

const ethGlobalRegExp = /(0x[a-fA-F0-9]{40})[\W\D\n]/g;
const ethSingleLineRegExp = /(0x[a-fA-F0-9]{40})[\W\D\n\s$]*/;

let detailsDecoration: TextEditorDecorationType | null = null;

const ethereumRPC = new RPCClient("https://rpc.ankr.com/eth");
const polygonRPC = new RPCClient("https://rpc-mainnet.matic.quiknode.pro");
const bscRPC = new RPCClient("https://binance.nodereal.io");

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
      Promise.all([
        ethereumRPC
          .symbol(match[1])
          .then((s) => (s ? s + " (Ethereum)" : null)),
        polygonRPC.symbol(match[1]).then((s) => (s ? s + " (Polygon)" : null)),
        bscRPC.symbol(match[1]).then((s) => (s ? s + " (BSC)" : null)),
      ])
        .then((symbols) => symbols.find((s) => !!s))
        .then((symbol) => {
          if (!symbol) {
            return;
          }
          const range = new Range(selection.start, selection.end);
          const hoverMessage = new MarkdownString();
          hoverMessage.appendText(symbol as string);
          detailsDecoration = window.createTextEditorDecorationType({
            isWholeLine: true,
            after: {
              color: "#5d5d55",
              contentText: `\t| ${symbol}`,
            },
          });

          event.textEditor.setDecorations(detailsDecoration, [
            {
              range,
              hoverMessage,
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
