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
  const [decryptionKey, setDecryptionKey] = useState<string>("");
  const [decryptedContent, setDecryptedContent] = useState<string>("");

  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig });
  algorand.setDefaultSigner(TransactionSigner);

  const formatTimestamp = (timestamp: number): string => {
    const localDate = new Date(timestamp * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const nftFactory = new NftContractFactory({ algorand, defaultSender: activeAccount?.address, defaultSigner: TransactionSigner });
  const nftClient = new NftContractClient({ appId: appId, algorand, defaultSigner: TransactionSigner });
  const revokeFactory = new NftRevokeFactory({ algorand, defaultSender: activeAccount?.address, defaultSigner: TransactionSigner });
  const revokeClient = new NftRevokeClient({ appId: revokeAppId, algorand, defaultSigner: TransactionSigner });

  useEffect(() => {
    if (TransactionSigner) algorand.setDefaultSigner(TransactionSigner);
  }, [TransactionSigner]);

  const decryptFile = async () => {
    try {
      if (!decryptionKey || !ipfsCID) return alert("Decryption key and IPFS CID required");

      const response = await fetch(`https://ipfs.io/ipfs/${ipfsCID}`);
      const encryptedData = await response.arrayBuffer();

      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(decryptionKey.padEnd(32, " ").slice(0, 32)),
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      const iv = new Uint8Array(encryptedData.slice(0, 12));
      const ciphertext = encryptedData.slice(12);

      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
      const decoded = new TextDecoder().decode(decrypted);
      setDecryptedContent(decoded);
    } catch (err) {
      console.error("Decryption error:", err);
      alert("Decryption failed");
    }
  };

  return (
    <div className="home-container">
      <div className="form-card">
        <h1>Welcome to <span className="bold">AlgoKit 🙂</span></h1>
        <p className="subtitle">Sell your asset at your fingertips</p>

        <button className="wallet-btn" onClick={toggleWalletModal}>Wallet Connection</button>

        <label>Asset Name</label>
        <input type="text" value={assetname} onChange={(e) => setassetname(e.currentTarget.value)} />
        <label>Patients Wallet Address</label>
        <input type="text" value={patientwallet} onChange={(e) => setpatientwallet(e.currentTarget.value)} />
        <label>Unit Name</label>
        <input type="text" value={unitname} onChange={(e) => setunitname(e.currentTarget.value)} />

        <h2>Upload NFT Metadata</h2>
        <NFTForm onUploadComplete={(cid) => setIpfsCID(cid)} />

        <MethodCall text="Create Asset" methodFunction={async () => {
          if (!ipfsCID) return alert("Upload metadata to IPFS first.");
          const assetUrl = `https://ipfs.io/ipfs/${ipfsCID}#arc3`;
          const newAssetId = await methods.create(algorand, activeAddress!, assetname, assetUrl, patientwallet, unitname);
          setAssetId(newAssetId);
        }} />

        {assetId !== 0n && <p><strong>Asset ID:</strong> {assetId.toString()}</p>}

        <MethodCall text="Create App" methodFunction={async () => {
          if (assetId === 0n) return alert("Create the Asset First !!!");
          const createApp = methods.createApplication(algorand, nftClient, nftFactory, TransactionSigner, activeAddress!, assetId, setAppId);
          const newAppId = await createApp();
          setAppId(newAppId);
        }} />

        {appId !== 0n && <p><strong>Application ID:</strong> {appId.toString()}</p>}

        <h3>AES Decryption</h3>
        <label>Decryption Key</label>
        <input type="text" value={decryptionKey} onChange={(e) => setDecryptionKey(e.target.value)} />
        <button onClick={decryptFile}>Decrypt File</button>
        {decryptedContent && (
          <div>
            <h4>Decrypted Content:</h4>
            <pre>{decryptedContent}</pre>
          </div>
        )}

        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    </div>
  );
};

export default Home;
