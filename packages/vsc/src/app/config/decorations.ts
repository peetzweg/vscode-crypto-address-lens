import { window } from 'vscode';

const commonStyle = {
  borderWidth: '0 0 2px 0',
  borderStyle: 'solid',
};

export const validChecksum = window.createTextEditorDecorationType({
  ...commonStyle,
  borderColor: '#00ff5a99',
  after: {
    contentText: '🟢',
    margin: '0 0 0 2px',
  },
});

export const invalidChecksum = window.createTextEditorDecorationType({
  ...commonStyle,
  borderColor: '#ff7877ee',
  after: {
    contentText: '🔴',
    margin: '0 0 0 2px',
  },
});

export const lowercase = window.createTextEditorDecorationType({
  ...commonStyle,
  borderColor: '#ffdb00ff',
  after: {
    contentText: '🟡',
    margin: '0 0 0 2px',
  },
});
