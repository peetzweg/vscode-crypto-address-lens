import {
  DecorationOptions,
  ExtensionContext,
  languages,
  MarkdownString,
  Range,
  TextEditor,
  TextEditorDecorationType,
  window,
  workspace,
} from "vscode";
import ethereum from "./addresses/ethereum";
import { AddressFixer } from "./AddressFixer";
import { ChainInfos } from "./config/chains";
import * as decorations from "./config/decorations";
import { RPCClient } from "./RPCClient";
import { toChecksumAddress } from "./utils/toChecksumAddress";

let detailsDecoration: TextEditorDecorationType | null = null;

let rpcClients: RPCClient[] = [];

function initRPCClients(): RPCClient[] {
  const clients = Object.entries(ChainInfos).map(([, chainDetails]) => {
    const enabled = workspace
      .getConfiguration("cryptoAddressLens." + chainDetails.configSection)
      .get("enabled");
    const rpc = workspace
      .getConfiguration("cryptoAddressLens." + chainDetails.configSection)
      .get("rpc");

    if (rpc && typeof rpc === "string") {
      if (enabled) {
        return new RPCClient(chainDetails.name, rpc);
      }
    } else {
      console.warn(
        `RPC Url for chain ${chainDetails.name} not correctly setup: ${rpc}`
      );
      return;
    }
  });

  return clients.filter((client) => !!client) as RPCClient[];
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    languages.registerCodeActionsProvider(
      { scheme: "file" },
      new AddressFixer(),
      {
        providedCodeActionKinds: AddressFixer.providedCodeActionKinds,
      }
    )
  );

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
  workspace.onWillSaveTextDocument(() => {
    if (window.activeTextEditor) {
      decorate(window.activeTextEditor);
    }
  });

  // Init rpcClients again if configuration has changed
  workspace.onDidChangeConfiguration(() => {
    rpcClients = initRPCClients();
  });

  // Init clients right before first use
  rpcClients = initRPCClients();
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

    let match = ethereum.line.exec(lineText);
    if (match !== null && match.length > 0) {
      Promise.all(
        rpcClients.map((c) =>
          c
            .symbol(match![1])
            .then((s) => (s ? s + ` (${c.networkName})` : null))
        )
      )
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

  while ((match = ethereum.global.exec(sourceCode))) {
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
