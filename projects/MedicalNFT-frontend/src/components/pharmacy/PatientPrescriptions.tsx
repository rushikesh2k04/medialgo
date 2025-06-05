import React, { useState } from "react";

// TODO: Replace this with real fetch logic from your backend or indexer
const pharmacyPrescriptions: Array<{ id: bigint; metadata?: string }> = [
  // Example: { id: 1234567890n, metadata: "https://ipfs.io/ipfs/..." }
];

const PatientPrescriptions: React.FC = () => {
  const [decrypted, setDecrypted] = useState<string | null>(null);

  const handleDecrypt = async (nft: { metadata?: string }) => {
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

  return (
    <div>
      <h2>Prescriptions</h2>
      {pharmacyPrescriptions.length === 0 && <div>No prescriptions available.</div>}
      {pharmacyPrescriptions.map(nft => (
        <div key={nft.id.toString()} style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}>
          <div>ID: {nft.id.toString()}</div>
          <div>Metadata: {nft.metadata || "N/A"}</div>
          <button onClick={() => handleDecrypt(nft)}>View</button>
        </div>
      ))}
      {decrypted && (
        <div>
          <h3>Decrypted Prescription</h3>
          <pre>{decrypted}</pre>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
