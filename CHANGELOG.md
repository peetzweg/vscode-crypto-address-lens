# Change Log
## [1.1.0] - 2023-05-12


### Added

+ adds new configuration property `crypoAddressLens.explorers` to configure block explorers to show up on address hover. It expects an object, key of this object is the explorers name, value is the URL of the block explorer which is suffixed with the address to lookup.

### Changed

+ deprecates configuration properties of the scheme `cryptoAddressLens.[network].rpc` and `cryptoAddressLens.[network].enabled`.

+ migrates ability to setup networks and rpcs into new configuration property called `cryptoAddressLens.rpcs`. It expects an objects which keys are the network name and the value is the RPC url. Pass `false` as value to deactivate the network.

## [1.0.1] - 2023-02-12

### Fixed

+ restores access to README and CHANGELOG from VSCode/marketplace

## [1.0.0] - 2023-02-12

### Changed

+ overhaul repository structure to make the extension better extendable and maintainable for the future.

## [0.5.1] - 2022-09-01

### Changed

+ Not showing symbol in hover message anymore. The implementation caused flickering when trying to reach for a blockscanner link with the mouse.

### Fixed

+ showing token symbol were not shown anymore at the end of the current line,

+ Code actions to convert selected address were only shown every other time.

## [0.5.0] - 2022-08-28

### Added

+ QuickFix actions to fix selected addresses checksum or convert it into a lowercase address,

+ disable address lookup for certain chains in the plugin settings or use extension configuration property: `cryptoAddressLens.[network].enabled=boolean`,

+ change default RPC servers in the plugin settings or use extension configuration property: `cryptoAddressLens.[network].rpc=string`.

### Fixed

+ disposes token name and symbol decoration more consistently now.

## [0.4.0] - 2022-08-17

### Added

+ shows "symbol()" value in line if available

## [0.3.3] - 2022-08-17

### Changed

+ decorates all visible editors on startup
+ always decorates the active editor, even without saving the file

### Fixed

+ properly decorate valid addresses at end of file or line

## [0.3.2] - 2022-08-08

### Changed

+ using `onStartupFinished` as `activationEvents` to be language agnostic

## [0.3.1] - 2022-08-06

### Removed

+ icon from README file

## [0.3.0] - 2022-08-06

### Added

+ extension icon
+ demo gif showcasing the extension functionality

### Changed

+ changes `invalid checksum` case color to red 🔴 instead of orange 🟠

## [0.2.0]

+ detects multiple address per line
+ simplifies styling to clash less with used editor theme
+ does not detect transaction hashes as addresses anymore

## [0.1.0]

Initial release of `crypto-address-lens`.
