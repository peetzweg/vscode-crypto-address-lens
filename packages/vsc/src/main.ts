import evm from '@crypto-address-lens/evm';
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
} from 'vscode';
import { AddressFixer } from './app/AddressFixer';
import * as decorations from './app/config/decorations';
import { RPCClient } from './app/RPCClient';

let detailsDecoration: TextEditorDecorationType | null = null;

let rpcClients: RPCClient[] = [];

let createExplorerMarkdown: (address: string) => string = () => '';

function initRPCClients() {
  const rpcs = workspace.getConfiguration('cryptoAddressLens').get('rpcs');

  const clients = Object.entries(rpcs).map(([chain, uri]) => {
    if (typeof uri === 'string' && uri) {
      return new RPCClient(chain, uri);
    }
  });

  rpcClients = clients.filter((client) => !!client) as RPCClient[];
}

function initExplorers() {
  const explorers = workspace
    .getConfiguration('cryptoAddressLens')
    .get('explorers');
  createExplorerMarkdown = (address: string) => {
    const links = Object.entries(explorers).map(([chain, uri]) => {
      if (typeof uri === 'string' && uri) {
        return `[${chain}](${uri}${address})`;
      }
    });

    return links.filter((explorer) => !!explorer).join(' | ');
  };
}

export function activate(context: ExtensionContext) {
  initExplorers();
  context.subscriptions.push(
    languages.registerCodeActionsProvider(
      { scheme: 'file' },
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
    initRPCClients();
    initExplorers();
  });

  // Init clients right before first use
  initRPCClients();

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

    const match = evm.match.line.exec(lineText);
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

          // Dispose old decoration again, because maybe a new one was added in the meantime.
          if (detailsDecoration) {
            detailsDecoration.dispose();
          }

          detailsDecoration = window.createTextEditorDecorationType({
            isWholeLine: true,
            after: {
              color: '#5d5d55',
              contentText: `\t| ${symbol}`,
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

  const validChecksumAddresses: DecorationOptions[] = [];
  const invalidChecksumAddresses: DecorationOptions[] = [];
  const lowercaseAddresses: DecorationOptions[] = [];

  let match;
  const regex = evm.match.global();
  while ((match = regex.exec(sourceCode))) {
    const matchedAddress = match[1];
    const startPos = editor.document.positionAt(match.index);
    const endPos = editor.document.positionAt(
      match.index + matchedAddress.length
    );
    const range = new Range(startPos, endPos);
    const checksumAddress = evm.utils.toChecksumAddress(matchedAddress);
    const hoverMessage = new MarkdownString();
    const explorerMarkdown = createExplorerMarkdown(checksumAddress);
    if (matchedAddress === checksumAddress) {
      hoverMessage.appendText('Checksum of address is valid.\n');
      hoverMessage.appendMarkdown(explorerMarkdown);
      validChecksumAddresses.push({
        range,
        hoverMessage,
      });
    } else if (matchedAddress === matchedAddress.toLowerCase()) {
      hoverMessage.appendText('Address is not using a checksum.\n');
      hoverMessage.appendMarkdown(explorerMarkdown);
      lowercaseAddresses.push({
        range,
        hoverMessage,
      });
    } else {
      hoverMessage.appendText('Checksum of address is invalid!\n');
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
