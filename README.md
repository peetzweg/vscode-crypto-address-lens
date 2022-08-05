# crypto-address-lens README

## Features

Highlights Ethereum style wallet addresses in your code. It will check if it's a valid address and even check if it has a correct checksum if mixed case was used.

See directly if the used address is valid.

It currently differentiates between these four states:

 1. Mixed Cased Address with **CORRECT** checksum

 2. Mixed Cased Address with **INVALID** checksum

 3. All upper or lower cased Address

 4. Not a valid address at all!
<!--
## Extension Settings

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something. -->

## Known Issues

+ only detects ONE address per line
+ detects part of a longer HexString as Address
+ hard to differentiate the individual cases

## Release Notes


### 0.1.0

Initial release of `crypto-address-lens`.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)


## Thanks

I used these tutorials to get me started.

https://vscode.rocks/decorations/

https://github.com/microsoft/vscode-extension-samples/blob/main/decorator-sample/USAGE.md


