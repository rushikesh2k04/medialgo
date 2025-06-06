import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import * as algokit from '@algorandfoundation/algokit-utils';
import { getAlgodConfigFromViteEnvironment } from '../../utils/network/getAlgoClientConfigs';
import { optIn } from '../../methods';

interface NFT {
  id: bigint;
  name: string;
  patientAddress: string;
  expiryDate?: string;
}

const PharmacyMarketplace: React.FC = () => {
  const { activeAddress, transactionSigner } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig });

  useEffect(() => {
    // TODO: Implement fetching available NFTs
    // This would come from your backend or the Algorand indexer
  }, []);

  const handleOptIn = async (assetId: bigint) => {
    if (!activeAddress || !transactionSigner) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading({ ...loading, [assetId.toString()]: true });
    try {
      await optIn(algorand, transactionSigner, activeAddress, assetId)();
      alert('Successfully opted in to the prescription NFT!');
    } catch (error) {
      console.error('Error opting in:', error);
      alert('Failed to opt in to the prescription NFT');
    } finally {
      setLoading({ ...loading, [assetId.toString()]: false });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Available Patient Prescriptions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <div key={nft.id.toString()} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">{nft.name}</h3>
            <div className="space-y-2 mb-4">
              <p className="text-gray-600">ID: {nft.id.toString()}</p>
              <p className="text-gray-600">Patient: {nft.patientAddress.slice(0, 8)}...</p>
              {nft.expiryDate && (
                <p className="text-gray-600">Expires: {nft.expiryDate}</p>
              )}
            </div>
            <button
              onClick={() => handleOptIn(nft.id)}
              disabled={loading[nft.id.toString()]}
              className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
                loading[nft.id.toString()]
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              {loading[nft.id.toString()] ? 'Processing...' : 'Opt In'}
            </button>
          </div>
        ))}
        
        {nfts.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No prescriptions available at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyMarketplace;