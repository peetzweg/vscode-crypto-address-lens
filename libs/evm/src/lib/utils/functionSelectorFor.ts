import keccak from 'keccak';

export function functionSelectorFor(fn: string) {
  return (
    '0x' +
    keccak('keccak256')
      .update('decimals()')
      .digest()
      .slice(0, 4)
      .toString('hex')
  );
}

export default functionSelectorFor;
