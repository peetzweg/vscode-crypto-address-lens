import * as vscode from 'vscode';
import evm from '@crypto-address-lens/evm';

export class AddressFixer implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction[] | undefined {
    const [rawAddress, rangeOfAddress] = this.getAddressOfCursor(
      document,
      range
    );
    if (!rawAddress || !rangeOfAddress) {
      return;
    }

    const fixes: vscode.CodeAction[] = [];

    const checksumAddress = evm.utils.toChecksumAddress(rawAddress);
    if (checksumAddress !== rawAddress) {
      const toCheckSumAddressFix = this.createFix(
        document,
        rangeOfAddress,
        checksumAddress,
        'Convert to address with checksum'
      );
      toCheckSumAddressFix.isPreferred = true;
      fixes.push(toCheckSumAddressFix);
    }

    if (rawAddress.toLowerCase() !== rawAddress) {
      const toLowerCaseFix = this.createFix(
        document,
        rangeOfAddress,
        rawAddress.toLowerCase(),
        'Convert to lowercase address'
      );
      if (fixes.length === 0) {
        toLowerCaseFix.isPreferred = true;
      }
      fixes.push(toLowerCaseFix);
    }

    return fixes;
  }

  private getAddressOfCursor(
    document: vscode.TextDocument,
    range: vscode.Range
  ): [string, vscode.Range] | [] {
    const cursorPosition = range.start;
    const lineText = document.lineAt(cursorPosition.line).text;

    let match;
    const regex = evm.match.global();
    while ((match = regex.exec(lineText))) {
      const matchedAddress = match[1];
      const [startCharacter, endCharacter] = [
        match.index,
        match.index + matchedAddress.length,
      ];
      if (
        cursorPosition.character >= startCharacter &&
        cursorPosition.character <= endCharacter
      ) {
        return [
          matchedAddress,
          new vscode.Range(
            new vscode.Position(cursorPosition.line, startCharacter),
            new vscode.Position(cursorPosition.line, endCharacter)
          ),
        ];
      }
    }
    return [];
  }

  private createFix(
    document: vscode.TextDocument,
    range: vscode.Range,
    newAddress: string,
    title: string
  ): vscode.CodeAction {
    const fix = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.replace(
      document.uri,
      new vscode.Range(range.start, range.end),
      newAddress
    );
    return fix;
  }
}
