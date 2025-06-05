import React, { useEffect, useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";

// For demo: Replace this with your backend call or indexer query
// This example uses localStorage for demonstration purposes
function getDoctorNFTsFromLocalStorage(address: string | undefined) {
  if (!address) return [];
  // Assume you store an array of { assetId, appId, metadata, createdAt } per address
  const key = `doctor_nfts_${address}`;
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data) as {
      assetId: string;
      appId: string;
      metadata?: string;
      createdAt?: string;
    }[];
  } catch {
    return [];
  }
}

const DoctorMarketplace: React.FC = () => {
  const { activeAddress } = useWallet();
  const [nfts, setNfts] = useState<
    { assetId: string; appId: string; metadata?: string; createdAt?: string }[]
  >([]);

  useEffect(() => {
    if (activeAddress) {
      setNfts(getDoctorNFTsFromLocalStorage(activeAddress));
    }
  }, [activeAddress]);

  return (
    <div>
      <h2>Your NFT Prescriptions</h2>
      <div>
        {nfts.length === 0 && <div>No NFTs created yet.</div>}
        {nfts.map((nft, idx) => (
          <div
            key={nft.assetId + "_" + nft.appId + "_" + idx}
            style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}
          >
            <div>
              <strong>Asset ID:</strong> {nft.assetId}
            </div>
            <div>
              <strong>App ID:</strong> {nft.appId}
            </div>
            <div>
              <strong>Metadata:</strong> {nft.metadata || "N/A"}
            </div>
            <div>
              <strong>Created:</strong>{" "}
              {nft.createdAt
                ? new Date(nft.createdAt).toLocaleString()
                : "N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorMarketplace;
