// src/components/Home.tsx
import * as algokit from "@algorandfoundation/algokit-utils";
import { useWallet } from "@txnlab/use-wallet-react";
import React, { useEffect, useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import MethodCall from "./components/MethodCall";
import * as methods from "./methods";
import * as revokeMethods from "./revoke_methods";
import { getAlgodConfigFromViteEnvironment } from "./utils/network/getAlgoClientConfigs";
import NFTForm from "./components/NFTForm";
import algosdk from "algosdk";
import "./styles/Home.css";
import { NftContractClient, NftContractFactory } from "./contracts/NFTContract";
import { NftRevokeClient, NftRevokeFactory } from "./contracts/NFTRevoke";

const Home: React.FC = () => {
  const [openWalletModal, setOpenWalletModal] = useState(false);
  const { activeAccount, activeAddress, transactionSigner: TransactionSigner } = useWallet();

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal);

  const [inputAppId, setInputAppId] = useState("");
  const [inputAssetId, setInputAssetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [appId, setAppId] = useState<bigint>(BigInt(0));
  const [assetId, setAssetId] = useState<bigint>(0n);
  const [assetname, setassetname] = useState<string>("");
  const [patientwallet, setpatientwallet] = useState<string>("");
  const [unitname, setunitname] = useState<string>("");
  const [ipfsCID, setIpfsCID] = useState<string>("");
  const [revokeAppId, setRevokeAppId] = useState<bigint>(0n);
  const [inputRevokeAppId, setInputRevokeAppId] = useState("");
  const [inputRevokeAssetId, setInputRevokeAssetId] = useState("");
  const [endsAt, setEndsAt] = useState<bigint | null>(null);

  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig });
  algorand.setDefaultSigner(TransactionSigner);

  const formatTimestamp = (timestamp: number): string => {
    const localDate = new Date(timestamp * 1000);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const nftFactory = new NftContractFactory({
    algorand: algorand,
    defaultSender: activeAccount?.address,
    defaultSigner: TransactionSigner,
  });

  const nftClient = new NftContractClient({
    appId: BigInt(appId),
    algorand: algorand,
    defaultSigner: TransactionSigner,
  });

  const revokeFactory = new NftRevokeFactory({
    algorand: algorand,
    defaultSender: activeAccount?.address,
    defaultSigner: TransactionSigner,
  });

  const revokeClient = new NftRevokeClient({
    appId: BigInt(revokeAppId),
    algorand,
    defaultSigner: TransactionSigner,
  });

  useEffect(() => {
    if (TransactionSigner) algorand.setDefaultSigner(TransactionSigner);
  }, [TransactionSigner]);

  return (
    <div className="home-container">
      <div className="form-card">
        <h1>
          Welcome to <span className="bold">AlgoKit 🙂</span>
        </h1>
        <p className="subtitle">Sell your asset at your fingertips</p>

        <button className="wallet-btn" onClick={toggleWalletModal}>
          Wallet Connection
        </button>

        <label>Asset Name</label>
        <input type="text" value={assetname} onChange={(e) => setassetname(e.currentTarget.value || "")} />
        <label>Patients Wallet Address</label>
        <input type="text" value={patientwallet} onChange={(e) => setpatientwallet(e.currentTarget.value || "")} />
        <label>Unit Name</label>
        <input type="text" value={unitname} onChange={(e) => setunitname(e.currentTarget.value || "")} />

        <h2>Upload NFT Metadata</h2>
        <NFTForm onUploadComplete={(cid) => setIpfsCID(cid)} />

        <MethodCall
          methodFunction={async () => {
            if (!ipfsCID) {
              alert("Upload metadata to IPFS first.");
              return;
            }

            const assetUrl = `https://ipfs.io/ipfs/${ipfsCID}#arc3`;
            const newAssetId = await methods.create(algorand, activeAddress!, assetname, assetUrl, patientwallet, unitname);
            setAssetId(newAssetId);
          }}
          text="Create Asset"
        />
        {assetId !== 0n && (
          <div className="asset-id-display">
            <p>
              <strong>Asset ID:</strong> {assetId.toString()}
            </p>
          </div>
        )}

        <MethodCall
          methodFunction={async () => {
            if (assetId === 0n) {
              alert("Create the Asset First !!!");
            }

            const createApp = methods.createApplication(
              algorand,
              nftClient,
              nftFactory,
              TransactionSigner,
              activeAddress!,
              assetId,
              setAppId
            );

            const newAppId = await createApp();
            setAppId(newAppId);
          }}
          text="Create App"
        />
        {appId !== 0n && (
          <div className="asset-id-display">
            <p>
              <strong>Application ID:</strong> {appId.toString()}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label>
            App ID:
            <input type="text" value={inputAppId} onChange={(e) => setInputAppId(e.target.value)} className="border p-1 rounded" />
          </label>

          <label>
            Asset ID:
            <input type="text" value={inputAssetId} onChange={(e) => setInputAssetId(e.target.value)} className="border p-1 rounded" />
          </label>
        </div>

        <MethodCall
          methodFunction={async () => {
            setLoading(true);
            try {
              if (!activeAccount) throw new Error("Please connect wallet first");
              if (!inputAppId) throw new Error("App ID is required");
              const appId = BigInt(inputAppId);
              const assetId = BigInt(inputAssetId);
              const appAddress = algosdk.getApplicationAddress(appId);

              const nftClient = new NftContractClient({
                appId: BigInt(appId),
                algorand: algorand,
                defaultSigner: TransactionSigner,
              });

              const transfer = methods.assetFromApp(algorand, nftClient, TransactionSigner, activeAddress!, assetId);

              await transfer();
              alert(`Asset ${assetId} transferred to ${activeAddress}`);
            } catch (err) {
              console.error(err);
              alert("Transfer failed. See console for details.");
            } finally {
              setLoading(false);
            }
          }}
          text={loading ? "Transferring..." : "Transfer from App"}
        />

        <MethodCall
          methodFunction={async () => {
            setLoading(true);
            try {
              if (!activeAccount) throw new Error("Please connect your wallet.");
              if (!inputAssetId) throw new Error("Asset ID is required for revoke.");

              const parsedAssetId = BigInt(inputAssetId);
              const newRevokeAppId = await revokeMethods.createApplication(
                algorand,
                revokeClient,
                revokeFactory,
                TransactionSigner,
                activeAddress!,
                parsedAssetId,
                setRevokeAppId
              );

              const newAppId = await newRevokeAppId();
              setRevokeAppId(newAppId);

              alert(`Revoke App Created with ID:  ${revokeAppId}`);
            } catch (err) {
              console.error(err);
              alert("Revoke App Creation failed. See console for details.");
            } finally {
              setLoading(false);
            }
          }}
          text={loading ? "Creating Revoke App..." : "Create Revoke Application"}
        />
        {appId !== 0n && (
          <div className="asset-id-display">
            <p>
              <strong>Application ID:</strong> {revokeAppId.toString()}
            </p>
          </div>
        )}
        <MethodCall
          methodFunction={async () => {
            try {
              const parsedAssetId = BigInt(inputAssetId);
              const parsedAppId = BigInt(revokeAppId);
              const clawbackAddress = await revokeMethods.changeClawBack(
                algorand,
                TransactionSigner,
                parsedAppId,
                activeAddress!,
                parsedAssetId
              );

              const result = await clawbackAddress();
              console.log(result, " Successfull");
            } catch (err) {
              console.error(err);
              alert(" Failed to Change the cLawback address:");
            } finally {
            }
          }}
          text="change claw back"
        />
        <div className="flex flex-col gap-2">
          <label>
            App ID:
            <input
              type="text"
              value={inputRevokeAppId}
              onChange={(e) => setInputRevokeAppId(e.target.value)}
              className="border p-1 rounded"
            />
          </label>

          <label>
            Asset ID:
            <input
              type="text"
              value={inputRevokeAssetId}
              onChange={(e) => setInputRevokeAssetId(e.target.value)}
              className="border p-1 rounded"
            />
          </label>
        </div>

        <MethodCall
          methodFunction={async () => {
            setLoading(true);
            try {
              if (!activeAccount) throw new Error("Please connect wallet first");
              if (!inputAppId) throw new Error("App ID is required");

              const appId = BigInt(inputRevokeAppId);
              const assetId = BigInt(inputRevokeAssetId);

              // 👉 Step 1: Calculate endsAt timestamp (30 minutes from now)
              const now = Date.now(); // milliseconds
              const endsAt = BigInt(Math.floor((now + 30 * 60 * 1000) / 1000)); // seconds + convert to bigint
              setEndsAt(endsAt);
              // Step 2: Create the client
              const revokeClient = new NftRevokeClient({
                appId: appId,
                algorand: algorand,
                defaultSigner: TransactionSigner,
              });

              // Step 3: Call your wrapped function with endsAt
              const transfer = revokeMethods.assetFromApp(
                algorand,
                revokeClient,
                TransactionSigner,
                activeAddress!,
                assetId,
                endsAt // ✅ Pass the timestamp here
              );

              await transfer();

              alert(`Asset ${assetId} transferred to ${activeAddress} with access ending at ${endsAt}`);
            } catch (err) {
              console.error(err);
              alert("Transfer failed. See console for details.");
            } finally {
              setLoading(false);
            }
          }}
          text={loading ? "Transferring..." : "Transfer from App"}
        />
        {Number(endsAt) && (
          <div className="input_div">
            <label>Access Ends At</label>
            <input type="datetime-local" value={formatTimestamp(Number(endsAt))} readOnly className="input_1" />
          </div>
        )}
        <MethodCall
          methodFunction={async () => {
            const getstatus = revokeMethods.status(algorand, revokeClient, TransactionSigner, activeAddress!);
            await getstatus;
          }}
          text="get status"
        />
        <MethodCall
          methodFunction={async () => {
            setLoading(true);
            try {
              const revokeClient = new NftRevokeClient({
                appId: revokeAppId,
                algorand: algorand,
                defaultSigner: TransactionSigner,
              });
              const revoke = revokeMethods.emergency_revoke(algorand, revokeClient, TransactionSigner, activeAddress!, assetId);
              await revoke();
              console.log("Revoke is successful");
            } catch (err) {
              console.error(err);
              alert("Transfer failed. See console for details.");
            } finally {
              setLoading(false);
            }
          }}
          text={loading ? "Revoking..." : "Revoke Asset"}
        />
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    </div>
  );
};

export default Home;
