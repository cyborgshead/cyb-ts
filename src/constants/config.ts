import { Networks } from 'src/types/networks';
import defaultNetworks from './defaultNetworks';

const DEFAULT_CHAIN_ID: Networks.BOSTROM | Networks.SPACE_PUSSY =
  Networks.BOSTROM;

export const CHAIN_ID = process.env.CHAIN_ID || DEFAULT_CHAIN_ID;

export const LCD = process.env.LCD || defaultNetworks[DEFAULT_CHAIN_ID].LCD;

export const API = process.env.API || defaultNetworks[DEFAULT_CHAIN_ID].API;

export const WEBSOCKET_URL =
  process.env.WEBSOCKET_URL || defaultNetworks[DEFAULT_CHAIN_ID].WEBSOCKET_URL;

export const INDEX_HTTPS =
  process.env.INDEX_HTTPS || defaultNetworks[DEFAULT_CHAIN_ID].INDEX_HTTPS;

export const INDEX_WEBSOCKET =
  process.env.INDEX_WEBSOCKET ||
  defaultNetworks[DEFAULT_CHAIN_ID].INDEX_WEBSOCKET;

export const BECH32_PREFIX =
  process.env.BECH32_PREFIX || defaultNetworks[DEFAULT_CHAIN_ID].BECH32_PREFIX;

export const BECH32_PREFIX_VALOPER = `${BECH32_PREFIX}valoper`;

export const DENOM =
  process.env.DENOM || defaultNetworks[DEFAULT_CHAIN_ID].DENOM;

export const DENOM_LIQUID =
  process.env.DENOM_LIQUID || defaultNetworks[DEFAULT_CHAIN_ID].DENOM_LIQUID;

export const CYBER_GATEWAY =
  process.env.CYBER_GATEWAY || 'https://gateway.ipfs.cybernode.ai';

export const DIVISOR_CYBER_G = 10 ** 9;

export const DEFAULT_GAS_LIMITS = 200000;

export const { MEMO_KEPLR } = defaultNetworks[DEFAULT_CHAIN_ID];
