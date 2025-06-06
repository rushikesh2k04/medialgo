import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import * as algokit from '@algorandfoundation/algokit-utils';
import { getAlgodConfigFromViteEnvironment } from '../../utils/network/getAlgoClientConfigs';
import CryptoJS from 'crypto-js';

interface Prescription {
  id: bigint;
  name: string;
  metadata?: string;
  encryptedData?: string;
  expiryDate?: string;
}

const Prescriptions: React.FC = () => {
  const { activeAddress } = useWallet();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [decryptionKey, setDecryptionKey] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);

  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig });

  useEffect(() => {
    if (activeAddress) {
      // TODO: Fetch user's prescriptions
      // This would come from your backend or the Algorand indexer
    }
  }, [activeAddress]);

  const handleDecrypt = async (prescription: Prescription) => {
    if (!decryptionKey) {
      alert('Please enter the decryption key');
      return;
    }

    try {
      if (!prescription.encryptedData) {
        throw new Error('No encrypted data available');
      }

      const bytes = CryptoJS.AES.decrypt(prescription.encryptedData, decryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Invalid decryption key');
      }

      setDecryptedContent(decrypted);
      setSelectedPrescription(prescription);
    } catch (error) {
      console.error('Decryption error:', error);
      alert('Failed to decrypt the prescription. Please check your key.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">My Prescriptions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prescriptions.map((prescription) => (
          <div key={prescription.id.toString()} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">{prescription.name}</h3>
            <div className="space-y-2 mb-4">
              <p className="text-gray-600">ID: {prescription.id.toString()}</p>
              {prescription.expiryDate && (
                <p className="text-gray-600">Expires: {prescription.expiryDate}</p>
              )}
            </div>
            
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Enter decryption key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                onChange={(e) => setDecryptionKey(e.target.value)}
              />
              <button
                onClick={() => handleDecrypt(prescription)}
                className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
              >
                View Prescription
              </button>
            </div>
          </div>
        ))}
        
        {prescriptions.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            You don't have any prescriptions yet.
          </div>
        )}
      </div>

      {selectedPrescription && decryptedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-semibold mb-4">
              Prescription Details - {selectedPrescription.name}
            </h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="whitespace-pre-wrap">{decryptedContent}</pre>
            </div>
            <button
              onClick={() => {
                setSelectedPrescription(null);
                setDecryptedContent(null);
              }}
              className="mt-4 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;