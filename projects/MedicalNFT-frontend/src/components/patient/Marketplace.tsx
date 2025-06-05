import React, { useEffect, useState } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import * as methods from '../../methods';

const PatientsMarketplace: React.FC = () => {
  const { activeAddress, transactionSigner } = useWallet();
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    // Fetch NFTs available for the patient to opt-in
    // setNfts(fetchedNFTs);
  }, []);

  const handleOptIn = async (assetId: bigint) => {
    await methods.optInAsset(algorand, activeAddress!, transactionSigner, assetId);
    alert(`Opted in to Asset ID: ${assetId}`);
  };

  return (
    <div className="patients-marketplace-container">
      <h2>Available NFTs</h2>
      <div className="nft-list">
        {nfts.map((nft) => (
          <div key={nft.assetId} className="nft-card">
            <h3>{nft.assetName}</h3>
            <button onClick={() => handleOptIn(nft.assetId)}>Opt-In</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientsMarketplace;
