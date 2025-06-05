import React, { useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { optIn } from "../../methods";
import * as algokit from "@algorandfoundation/algokit-utils";

// TODO: Replace this with real NFT fetching logic from your backend or indexer
const availableNFTs: Array<{ id: bigint; metadata?: string }> = [
  // Example: { id: 1234567890n, metadata: "Prescription for Jane Doe" }
];

const algorand = /* get your algorand client instance */ null as unknown as algokit.AlgorandClient;

const PharmacyMarketplace: React.FC = () => {
  const { activeAddress, transactionSigner } = useWallet();
  const [loading, setLoading] = useState<bigint | null>(null);

  const handleOptIn = async (assetId: bigint) => {
    if (!activeAddress || !transactionSigner) {
      alert("Connect wallet first");
      return;
    }
    setLoading(assetId);
    try {
      await optIn(algorand, transactionSigner, activeAddress, assetId)();
      alert("Opted in!");
    } catch {
      alert("Opt-in failed");
    }
    setLoading(null);
  };

  return (
    <div>
      <h2>Patient-Transferred Prescriptions</h2>
      {availableNFTs.length === 0 && <div>No prescriptions available.</div>}
      {availableNFTs.map(nft => (
        <div key={nft.id.toString()} style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}>
          <div>ID: {nft.id.toString()}</div>
          <div>Metadata: {nft.metadata || "N/A"}</div>
          <button onClick={() => handleOptIn(nft.id)} disabled={loading === nft.id}>
            {loading === nft.id ? "Opting in..." : "Opt-in"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default PharmacyMarketplace;
