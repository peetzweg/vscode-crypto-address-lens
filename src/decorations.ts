import { window } from "vscode";

const commonStyle = {
  borderWidth: "0 0 2px 0",
  borderStyle: "solid",
};

export const validChecksum = window.createTextEditorDecorationType({
  ...commonStyle,
  borderColor: "#00ff5a55",
  after: {
    contentText: "🟢",
    margin: "0 0 0 2px",
  },
});

export const invalidChecksum = window.createTextEditorDecorationType({
  ...commonStyle,
  borderColor: "#ffd283ee",
  after: {
    contentText: "🟠",
    margin: "0 0 0 2px",
  },
});

export const lowercase = window.createTextEditorDecorationType({
  ...commonStyle,
  borderColor: "#fff17aee",
  after: {
    contentText: "🟡",
    margin: "0 0 0 2px",
  },
});
