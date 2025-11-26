# TAC SDK with Morpho Integration Guide

## Getting Started

1. Install @tonappchain/sdk (assuming that `ethers` and `@tonconnect/ui` are already installed):

    ```bash
    npm i @tonappchain/sdk
    ```

2. Initialize TAC SDK before using its methods:

    ```ts
    import { Network, TacSdk } from '@tonappchain/sdk';
    
    const tacSdk = await TacSdk.create({ network: Network.MAINNET });
    ```

3. These constants will be used throughout examples below, copy them where you see fit:

    ```ts
    export const IS_TESTNET = false
    export const TON_ON_TAC_ADDRESS = IS_TESTNET
      ? '0xe3a2296bE422768a630eb35014978A808D106899'
      : '0xb76d91340F5CE3577f0a056D29f6e3Eb4E88B140'
    export const MORPHO_PROXY = IS_TESTNET 
      ? '0x001e29479B3DFbaA0c371EaA5E23E157e188871d'
      : '0x21b5562FEee5013379F8F79C5093EC294d535BEC'
    ```

## Operations

### General
Refer to [Morpho docs](https://docs.morpho.org/build/earn/tutorials/assets-flow). Some methods are 
not provided in script, i.e. `withdraw` for partial withdrawals, but implementation is
straightforward enough with `TacSdk` - just describe EVM method (usually with `(bytes,bytes)` arguments), and provide assets if 
they are required.

### Methods
Refer to [index.ts](./src/index.ts). Does not work as-is, provide `tacSdk` and `tonConnectUI` instances.

## Getting Relevant Information

### General
Refer to [Morpho API Guide](https://docs.morpho.org/tools/offchain/api/get-started/).
You can retrieve a list of vaults and detailed vault information by using their own GraphQL API. 

### Vaults Balances

You can use [Toncenter API](https://toncenter.com/api/v3/index.html) or any other indexer/RPC to
fetch jetton balances that correspond to each vault. You can check the symbols to find corresponding balances or batch the 
EVM-TVM address conversions (safer):

```ts
// Better to use memoization
export const convertAddresses = async () => {
   const evmAddresses: string[] = []
   const batchSize = 5
   const convertedAddresses = new Map()
   for (let i = 0; i < evmAddresses.length; i += batchSize) {
      const batch = evmAddresses.slice(i, i + batchSize)
      const allSettled = Promise.allSettled
              ? Promise.allSettled.bind(Promise)
              : (pr: Promise<any>[]) =>
                      Promise.all(pr.map(p => p
                              .then(v => ({status: 'fulfilled', value: v}))
                              .catch(e => ({status: 'rejected', reason: e}))))

      const results = await allSettled(batch.map(addr => tacSdk.getTVMTokenAddress(addr)))

      batch.forEach((evmAddress, idx) => {
         const res = results[idx]
         const tvm = res.status === 'fulfilled' && res.value ? res.value : 'NONE'
         convertedAddresses.set(evmAddress, tvm)
      })
   }

   return convertedAddresses
}
```
