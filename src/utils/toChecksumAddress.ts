const keccak = require("keccak");

export function toChecksumAddress(address: string) {
  const stripAddress = stripHexPrefix(address).toLowerCase();

  const keccakHash = keccak("keccak256").update(stripAddress).digest("hex");
  let checksumAddress = "0x";

  for (let i = 0; i < stripAddress.length; i++) {
    checksumAddress +=
      parseInt(keccakHash[i], 16) >= 8
        ? stripAddress[i].toUpperCase()
        : stripAddress[i];
  }

  return checksumAddress;
}

function stripHexPrefix(address: string) {
  return address.slice(0, 2) === "0x" ? address.slice(2) : address;
}

export default toChecksumAddress;
