import * as algokit from "@algorandfoundation/algokit-utils";
import { NftRevokeClient, NftRevokeFactory } from "./contracts/NFTRevoke";
import { TransactionSigner, CommonTransactionParams } from "algosdk";
import algosdk from "algosdk";

export function createApplication(
  algorand: algokit.AlgorandClient,
  revokeclient: NftRevokeClient,
  revokefactory: NftRevokeFactory,
  signer: TransactionSigner,
  sender: string,
  assetId: bigint,
  setAppId: (id: bigint) => void
): () => Promise<bigint> {
  return async () => {
    const result = await revokefactory.send.create.createApplication({ args: [assetId], sender });

    const newClient = new NftRevokeClient({ appId: result.appClient.appId, algorand, defaultSigner: signer });

    const mbrpay = await algorand.createTransaction.payment({
      sender,
      receiver: result.appClient.appAddress,
      amount: algokit.algos(0.2),
      extraFee: algokit.algos(0.001),
    });

    await newClient.send.optInToAsset({ args: [mbrpay], sender, assetReferences: [assetId] });
    console.log("Asset id opted to application");

    await algorand.send.assetTransfer({
      sender,
      assetId,
      receiver: result.appClient.appAddress,
      amount: BigInt(1),
    });

    const appId = BigInt(result.appClient.appId);
    setAppId(appId);

    console.log("the asset is transfered to application" + String(appId));
    return appId;
  };
}

export function changeClawBack(
  algorand: algokit.AlgorandClient,
  signer: TransactionSigner,
  appId: bigint,
  sender: string,
  assetId: bigint
) {
  return async () => {
    try {
      const assetInfo = await algorand.asset.getById(assetId);
      console.log(assetInfo.manager);
      console.log(sender);
      const newappId = BigInt(appId);
      const appAddress = algosdk.getApplicationAddress(newappId);
      const txn_result = algorand.send.assetConfig({
        sender: sender,
        assetId: assetId,
        manager: sender,
        clawback: appAddress,
      });
      console.log("Asset update transaction ID:", (await txn_result).txIds);
    } catch (error) {
      console.log(error);
    }
  };
}

export function assetFromApp(
  algorand: algokit.AlgorandClient,
  revokeclient: NftRevokeClient,
  signer: TransactionSigner,
  sender: string,
  assetID: bigint,
  endsAt: bigint
) {
  return async () => {
    try {
      try {
        console.log(sender);
        const accountInfo = await algorand.asset.getAccountInformation(sender, assetID);
        if (accountInfo && accountInfo.balance > 0n) {
          alert("You Already Own this asset. You cannot purchase it again.");
          return;
        }
      } catch (error) {
        console.log("User does not own the asset. Proceeding with purchase....");
      }
      await algorand.send.assetOptIn({ sender: sender, assetId: assetID, signer });
      const result = await revokeclient.send.grantAccess({ args: [sender, endsAt], sender: sender, assetReferences: [assetID] });
      console.log("Transfered the asset:", result);
    } catch (error) {
      console.log(error);
    }
  };
}

export function status(algorand: algokit.AlgorandClient, revokeclient: NftRevokeClient, signer: TransactionSigner, sender: string) {
  const output = revokeclient.send.getStatus({args: [],sender, signer});
  console.log(output);
}

export function emergency_revoke(
  algorand: algokit.AlgorandClient,
  revokeclient: NftRevokeClient,
  signer: TransactionSigner,
  sender: string,
  assetId: bigint
) {
  return async () => {
    try {
      const result = await revokeclient.send.emergencyRevoke({ args: [], sender: sender, assetReferences: [assetId] });
      console.log("Revoke is successful", result);
    } catch (err) {
      console.log(err);
    }
  };
}
