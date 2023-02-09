import functionSelectorFor from './functionSelectorFor';

describe('utils', () => {
  describe('functionSelectorFor', () => {
    it('should work', () => {
      const fnName = 'decimals()';
      const fnSelector = functionSelectorFor(fnName);
      assert(fnSelector);
      expect(fnSelector).toEqual('0x313ce567');
    });
  });
});
