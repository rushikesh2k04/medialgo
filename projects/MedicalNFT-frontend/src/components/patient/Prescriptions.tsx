import React, { useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import * as algokit from "@algorandfoundation/algokit-utils";
import { assetFromApp as assetFromRevokeApp } from "../../revoke_methods";
import { NftRevokeClient } from "../../contracts/NFTRevoke";

// Placeholder: Replace with real logic to fetch patient's NFTs
const ownedNFTs: Array<{ id: bigint; metadata?: string; appId: bigint }> = [
  // Example: { id: 1234567890n, metadata: "Prescription for John Doe", appId: 987654321n }
];

const algorand = /* get your algorand client instance */ null as unknown as algokit.AlgorandClient;

const Prescriptions: React.FC = () => {
  const { activeAddress, transactionSigner } = useWallet();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<{ id: bigint; appId: bigint } | null>(null);
  const [endsAt, setEndsAt] = useState(""); // Timestamp or formatted date as string
  const [loading, setLoading] = useState(false);

  // For viewing/decrypting, you would fetch metadata or IPFS content here
  const [decrypted, setDecrypted] = useState<string | null>(null);

  const handleDecrypt = async (nft: { metadata?: string }) => {
    // If your metadata is a URL (e.g., IPFS), fetch it here
    if (nft.metadata && nft.metadata.startsWith("http")) {
      try {
        const response = await fetch(nft.metadata);
        const data = await response.text();
        setDecrypted(data);
      } catch {
        setDecrypted("Unable to fetch prescription data.");
      }
    } else {
      setDecrypted(nft.metadata || "No metadata available.");
    }
  };

  const handleTransfer = async () => {
    if (!activeAddress || !transactionSigner || !selectedNFT) {
      alert("Connect wallet and select NFT.");
      return;
    }
    setLoading(true);
    try {
      // Convert endsAt (date/time string) to a BigInt timestamp if needed
      // For demo, use Date.now() + 1 hour as expiry
      const endsAtBigInt = BigInt(Date.now() + 3600 * 1000);
      const revokeClient = new NftRevokeClient({
        appId: selectedNFT.appId,
        algorand,
        defaultSigner: transactionSigner,
      });
      await assetFromRevokeApp(
        algorand,
        revokeClient,
        transactionSigner,
        activeAddress,
        selectedNFT.id,
        endsAtBigInt
      )();
      setShowPopup(false);
      alert("NFT transferred with revoke schedule!");
    } catch (e) {
      alert("Transfer failed");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>My Prescriptions</h2>
      {ownedNFTs.map(nft => (
        <div key={nft.id.toString()} style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}>
          <div>ID: {nft.id.toString()}</div>
          <div>Metadata: {nft.metadata || "N/A"}</div>
          <button onClick={() => handleDecrypt(nft)}>View</button>
          <button onClick={() => { setSelectedNFT({ id: nft.id, appId: nft.appId }); setShowPopup(true); }}>Transfer</button>
        </div>
      ))}
      {decrypted && (
        <div>
          <h3>Decrypted Prescription</h3>
          <pre>{decrypted}</pre>
        </div>
      )}
      {showPopup && selectedNFT && (
        <div className="popup">
          <h3>Set Revoke Expiry</h3>
          {/* For demo, you can use a date input or just use a fixed time */}
          <input
            type="datetime-local"
            value={endsAt}
            onChange={e => setEndsAt(e.target.value)}
          />
          <button onClick={handleTransfer} disabled={loading}>
            {loading ? "Transferring..." : "Transfer"}
          </button>
          <button onClick={() => setShowPopup(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
