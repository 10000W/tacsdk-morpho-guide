import {SenderFactory, AssetType, type TacSdk} from '@tonappchain/sdk';
import type {EvmProxyMsg} from '@tonappchain/sdk';
import {AbiCoder, getAddress, MaxUint256} from 'ethers';
import type {TonConnectUI} from "@tonconnect/ui";

let tacSdk!: TacSdk // Retrieve it form outside store
let tonConnectUI!: TonConnectUI // Retrieve it form outside store
export const IS_TESTNET = false
export const TON_ON_TAC_ADDRESS = IS_TESTNET
  ? '0xe3a2296bE422768a630eb35014978A808D106899'
  : '0xb76d91340F5CE3577f0a056D29f6e3Eb4E88B140'
export const MORPHO_PROXY = IS_TESTNET
  ? '0x001e29479B3DFbaA0c371EaA5E23E157e188871d'
  : '0x21b5562FEee5013379F8F79C5093EC294d535BEC'

const deposit = async (tokenAddress: string, vaultAddress: string, amount: bigint) => {
  const evmProxyMsg: EvmProxyMsg = {
    evmTargetAddress: MORPHO_PROXY,
    methodName: 'deposit(bytes,bytes)',
    encodedParameters: new AbiCoder().encode(
      ['tuple(address,uint256,uint256)'],
      [[
        vaultAddress,
        amount,
        MaxUint256
      ]]
    )
  };
  const sender = await SenderFactory.getSender({tonConnect: tonConnectUI});
  const assets = [{
    // if sending TON, address property should be empty
    address: tokenAddress === TON_ON_TAC_ADDRESS ? undefined : await tacSdk.getTVMTokenAddress(getAddress(tokenAddress)),
    rawAmount: amount,
    type: AssetType.FT
  }];

  return await tacSdk.sendCrossChainTransaction(
    evmProxyMsg,
    sender,
    assets
  );
};

const borrow = async (oracle: string, irm: string, loanToken: string, collateralToken: string, lltv: bigint, amount: bigint) => {
  const evmProxyMsg: EvmProxyMsg = {
    evmTargetAddress: MORPHO_PROXY,
    methodName: 'borrow(bytes,bytes)',
    encodedParameters: new AbiCoder().encode(
      ['tuple(tuple(address,address,address,address,uint256),uint256,uint256,uint256)'],
      [[[loanToken, collateralToken, oracle, irm, lltv], amount, 0n, 0n]]
    )
  };
  const sender = await SenderFactory.getSender({tonConnect: tonConnectUI});

  return await tacSdk.sendCrossChainTransaction(
    evmProxyMsg,
    sender
  );
};

const redeem = async (vaultAddress: string, amount: bigint) => {
  const evmProxyMsg: EvmProxyMsg = {
    evmTargetAddress: MORPHO_PROXY,
    methodName: 'redeem(bytes,bytes)',
    encodedParameters: new AbiCoder().encode(
      ['tuple(address,uint256,uint256)'],
      [[
        vaultAddress,
        amount,
        0n
      ]]
    )
  };
  const sender = await SenderFactory.getSender({tonConnect: tonConnectUI});
  const assets = [{
    address: await tacSdk.getTVMTokenAddress(getAddress(vaultAddress)),
    rawAmount: amount,
    type: AssetType.FT
  }];

  return await tacSdk.sendCrossChainTransaction(
    evmProxyMsg,
    sender,
    assets
  );
};

const supplyCollateral = async (
  oracle: string, irm: string,
  loanToken: string, collateralToken: string,
  lltv: bigint, amount: bigint
) => {
  const evmProxyMsg: EvmProxyMsg = {
    evmTargetAddress: MORPHO_PROXY,
    methodName: 'supplyCollateral(bytes,bytes)',
    encodedParameters: new AbiCoder().encode(
      ['tuple(tuple(address,address,address,address,uint256),uint256)'],
      [[[loanToken, collateralToken, oracle, irm, lltv], amount]]
    )
  };
  const sender = await SenderFactory.getSender({tonConnect: tonConnectUI});
  const assets = [{
    address: collateralToken === TON_ON_TAC_ADDRESS
      ? undefined
      : await tacSdk.getTVMTokenAddress(getAddress(collateralToken)),
    rawAmount: amount,
    type: AssetType.FT
  }];

  return await tacSdk.sendCrossChainTransaction(
    evmProxyMsg,
    sender,
    assets
  );
};

const supplyCollateralAndBorrow = async (
  oracle: string, irm: string,
  loanToken: string, collateralToken: string,
  lltv: bigint, amount: bigint, amountLoan: bigint
) => {
  const evmProxyMsg: EvmProxyMsg = {
    evmTargetAddress: MORPHO_PROXY,
    methodName: 'supplyCollateralAndBorrow(bytes,bytes)',
    encodedParameters: new AbiCoder().encode(
      ['tuple(tuple(address,address,address,address,uint256),uint256)',
        'tuple(tuple(address,address,address,address,uint256),uint256,uint256,uint256)'],
      [[[loanToken, collateralToken, oracle, irm, lltv], amount],
        [[loanToken, collateralToken, oracle, irm, lltv], amountLoan, 0n, 0n]]
    )
  };
  const sender = await SenderFactory.getSender({tonConnect: tonConnectUI});
  const assets = [{
    address: collateralToken === TON_ON_TAC_ADDRESS
      ? undefined
      : await tacSdk.getTVMTokenAddress(getAddress(collateralToken)),
    rawAmount: amount,
    type: AssetType.FT
  }];

  return await tacSdk.sendCrossChainTransaction(
    evmProxyMsg,
    sender,
    assets
  );

};

const repay = async (oracle: string, irm: string, loanToken: string, collateralToken: string, lltv: bigint, amount: bigint, shares?: bigint) => {
  const evmProxyMsg: EvmProxyMsg = {
    evmTargetAddress: MORPHO_PROXY,
    methodName: 'repay(bytes,bytes)',
    encodedParameters: new AbiCoder().encode(
      ['tuple(tuple(address,address,address,address,uint256),uint256,uint256,uint256)'],
      [[[loanToken, collateralToken, oracle, irm, lltv],
        shares ? 0n : amount,
        shares ? shares : 0n,
        MaxUint256
      ]]
    )
  };
  const sender = await SenderFactory.getSender({tonConnect: tonConnectUI});
  const assets = [{
    address: loanToken === TON_ON_TAC_ADDRESS
      ? undefined
      : await tacSdk.getTVMTokenAddress(getAddress(loanToken)),
    rawAmount: amount,
    type: AssetType.FT
  }];

  return await tacSdk.sendCrossChainTransaction(
    evmProxyMsg,
    sender,
    assets
  );
};

const withdrawCollateral = async (oracle: string, irm: string, loanToken: string, collateralToken: string, lltv: bigint, amount: bigint) => {
  const evmProxyMsg: EvmProxyMsg = {
    evmTargetAddress: MORPHO_PROXY,
    methodName: 'withdrawCollateral(bytes,bytes)',
    encodedParameters: new AbiCoder().encode(
      ['tuple(tuple(address,address,address,address,uint256),uint256)'],
      [[[loanToken, collateralToken, oracle, irm, lltv], amount]],
    )
  };
  const sender = await SenderFactory.getSender({tonConnect: tonConnectUI});

  return await tacSdk.sendCrossChainTransaction(
    evmProxyMsg,
    sender
  );
};

const repayAndWithdrawCollateral = async (oracle: string, irm: string, loanToken: string, collateralToken: string, lltv: bigint, amount: bigint, amountLoan: bigint, shares: bigint) => {
  const evmProxyMsg: EvmProxyMsg = {
    evmTargetAddress: MORPHO_PROXY,
    methodName: 'repayAndWithdrawCollateral(bytes,bytes)',
    encodedParameters: new AbiCoder().encode(
      ['tuple(tuple(address,address,address,address,uint256),uint256,uint256,uint256)',
        'tuple(tuple(address,address,address,address,uint256),uint256)'],
      [[[loanToken, collateralToken, oracle, irm, lltv],
        shares ? 0n : amount,
        shares ? shares : 0n,
        MaxUint256
      ], [[loanToken, collateralToken, oracle, irm, lltv], amountLoan]]
    )
  };
  const sender = await SenderFactory.getSender({tonConnect: tonConnectUI});
  const assets = [{
    address: loanToken === TON_ON_TAC_ADDRESS
      ? undefined
      : await tacSdk.getTVMTokenAddress(getAddress(loanToken)),
    rawAmount: amount,
    type: AssetType.FT
  }];
  return await tacSdk.sendCrossChainTransaction(
    evmProxyMsg,
    sender,
    assets
  );
};
