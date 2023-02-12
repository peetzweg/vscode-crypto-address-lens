import match from './';

describe('evm.match', () => {
  it('should work', () => {
    const input = '0xae78736cd615f374d3085123a210448e74fc6393';
    const matchResult = match.line.exec(input);

    assert(matchResult);
    expect(matchResult[0]).toEqual(
      '0xae78736cd615f374d3085123a210448e74fc6393'
    );
  });
});
