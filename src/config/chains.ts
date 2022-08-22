enum ChainId {
  ETHEREUM = 1,
  POLYGON = 137,
  BSC = 56,
  LOCAL = 1337,
  CUSTOM = -1,
}

interface ChainDetails {
  name: string;
  configSection: string;
}

export const ChainInfos: Record<ChainId, ChainDetails> = {
  [ChainId.ETHEREUM]: {
    name: "Ethereum",
    configSection: "ethereum",
  },
  [ChainId.POLYGON]: {
    name: "Polygon",
    configSection: "polygon",
  },
  [ChainId.BSC]: {
    name: "Binance Smart Chain",
    configSection: "bsc",
  },
  [ChainId.LOCAL]: {
    name: "Ethereum",
    configSection: "local",
  },
  [ChainId.CUSTOM]: {
    name: "Custom",
    configSection: "custom",
  },
};
