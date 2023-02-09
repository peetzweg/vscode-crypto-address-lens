export const ethGlobalRegExp = /(0x[a-fA-F0-9]{40})[\W\D\n]/g;
export const ethSingleLineRegExp = /(0x[a-fA-F0-9]{40})[\W\D\n\s$]*/;

export default {
  global: () => /(0x[a-fA-F0-9]{40})[\W\D\n]/g,
  line: ethSingleLineRegExp,
};
