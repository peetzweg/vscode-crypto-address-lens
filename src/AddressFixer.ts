import * as vscode from "vscode";
import ethereum from "./addresses/ethereum";
import toChecksumAddress from "./utils/toChecksumAddress";

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

    if (rawAddress.toLowerCase() !== rawAddress) {
      const toLowerCaseFix = this.createFix(
        document,
        rangeOfAddress,
        rawAddress.toLowerCase(),
        "Convert to lowercase address"
      );
      fixes.push(toLowerCaseFix);
    }

    const checksumAddress = toChecksumAddress(rawAddress);
    if (checksumAddress !== rawAddress) {
      const toCheckSumAddressFix = this.createFix(
        document,
        rangeOfAddress,
        checksumAddress,
        "Fix address checksum"
      );
      toCheckSumAddressFix.isPreferred = true;
      fixes.push(toCheckSumAddressFix);
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
    while ((match = ethereum.global.exec(lineText))) {
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
