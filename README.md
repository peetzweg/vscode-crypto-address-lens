# 🔭 Crypto Address Lens (for VSCode)

[➡ Install Extension on Marketplace](https://marketplace.visualstudio.com/items?itemName=peetzweg.crypto-address-lens)

[➡ Fund Extension on Gitcoin](https://gitcoin.co/grants/9316/address-lens-ide-extension)

## Features

+ highlights ethereum style addresses
+ tells you if address checksum is correct
+ directly links to blockchain explorer
+ shows contracts "symbol()" inline if available
+ offers code actions (`'CMD'` + `'.'`) to fix checksum of address or convert it to lowercase

![demo](https://raw.githubusercontent.com/peetzweg/vscode-crypto-address-lens/main/demo.gif)

## Configuration

Valid configurations settings with defaults:

```json
{
    "cryptoAddressLens.ethereum.rpc": "https://rpc.ankr.com/eth",
    "cryptoAddressLens.ethereum.enabled": true,

    "cryptoAddressLens.polygon.rpc": "https://rpc-mainnet.matic.quiknode.pro",
    "cryptoAddressLens.polygon.enabled": true,

    "cryptoAddressLens.bsc.rpc": "https://binance.nodereal.io",
    "cryptoAddressLens.bsc.enabled": true,

    "cryptoAddressLens.local.rpc": "http://localhost:8545",
    "cryptoAddressLens.local.enabled": false,

    "cryptoAddressLens.custom.rpc": "http://localhost:8545",
    "cryptoAddressLens.custom.enabled": false
}
```

---

Highlights Ethereum style wallet addresses in your code. It will check if it's a valid address and even check if it has a correct checksum if mixed case was used.

See directly if the used address is valid.

It currently differentiates between these four states:

 1. Mixed Cased Address with **CORRECT** checksum

 2. Mixed Cased Address with **INVALID** checksum

 3. All lower cased Address

 4. Not a valid address at all!
<!--
## Extension Settings

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something. -->

## Known Issues

See [Issues on Github](https://github.com/peetzweg/vscode-crypto-address-lens/issues)

## Release Notes

See [CHANGELOG](./CHANGELOG.md)

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)


## Thanks

I used these tutorials to get me started.

### Decorations

https://vscode.rocks/decorations/

https://github.com/microsoft/vscode-extension-samples/blob/main/decorator-sample/USAGE.md

### Diagnostics

https://github.com/microsoft/vscode-extension-samples/blob/main/code-actions-sample/src/extension.ts