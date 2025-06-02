import React, { useState } from "react";
import CryptoJS from "crypto-js";

interface NFTFormProps {
  onUploadComplete: (ipfsCID: string) => void;
}

const NFTForm: React.FC<NFTFormProps> = ({ onUploadComplete }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState("");

  const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmN2IwY2NjMC03ZTNmLTQ2NzUtYWUyYS01MTU3YjhiYjMyMGMiLCJlbWFpbCI6InJ1c2hpa2VzaDkuMjAwNEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNWE3YmU3MDkyYzc1MDBlZTkyMDkiLCJzY29wZWRLZXlTZWNyZXQiOiJhOTA3NDAwZDExYWI2ZTFmOGQ1NjlmZTgwYTFkYzZiMzJkZWU5YTk3ZGQwODUxMzBlMzZhMTRjMDViODNhZWNkIiwiZXhwIjoxNzc3ODUwNTUzfQ.DjmtmIocrDt_ydUJ_6imHL_0Ik4uxi1RRrX4MPwET1o";

  const uploadToIPFS = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!res.ok) {
      throw new Error("Upload to IPFS failed.");
    }

    const data = await res.json();
    return data.IpfsHash;
  };

  const encryptPDF = async (file: File): Promise<{ encryptedFile: File; keyHex: string }> => {
    const arrayBuffer = await file.arrayBuffer();
    const key = CryptoJS.lib.WordArray.random(32); // 256-bit key
    const iv = CryptoJS.lib.WordArray.random(16);

    const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
    const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const ivAndCiphertext = iv.concat(encrypted.ciphertext);
    const encryptedBlob = new Blob([Uint8Array.from(CryptoJS.enc.Hex.parse(ivAndCiphertext.toString()).words.map(w => [
      (w >> 24) & 0xff, (w >> 16) & 0xff, (w >> 8) & 0xff, w & 0xff
    ]).flat())], { type: "application/octet-stream" });

    const encryptedFile = new File([encryptedBlob], "encrypted_receipt.bin");
    const keyHex = key.toString(CryptoJS.enc.Hex);
    return { encryptedFile, keyHex };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      if (!imageFile || !pdfFile) throw new Error("Image and PDF required");

      // Encrypt the PDF file
      const { encryptedFile, keyHex } = await encryptPDF(pdfFile);
      setEncryptionKey(keyHex);

      // Upload both files to IPFS
      const [imageCID, encryptedPdfCID] = await Promise.all([
        uploadToIPFS(imageFile),
        uploadToIPFS(encryptedFile),
      ]);

      // Prepare metadata
      const metadata = {
        name: title,
        description,
        image: `ipfs://${imageCID}`,
        encrypted_pdf: `ipfs://${encryptedPdfCID}`,
        properties: {
          file_type: "nft_asset",
          encryption: "AES-256-CBC",
        },
      };

      const blob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
      const metadataFile = new File([blob], "metadata.json");
      const metadataCID = await uploadToIPFS(metadataFile);

      onUploadComplete(metadataCID);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-4">
      <label className="label">NFT Title</label>
      <input
        className="input input-bordered w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="label">Description</label>
      <textarea
        className="textarea textarea-bordered w-full"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label className="label">Upload Image</label>
      <input
        type="file"
        accept="image/*"
        className="file-input file-input-bordered w-full"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
      />

      <label className="label">Upload PDF</label>
      <input
        type="file"
        accept=".pdf"
        className="file-input file-input-bordered w-full"
        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
      />

      <button
        className={`btn w-full ${success ? "bg-green-500 text-white" : ""}`}
        type="submit"
        disabled={loading}
      >
        {loading ? "Uploading..." : success ? "Uploaded!" : "Upload to IPFS"}
      </button>

      {encryptionKey && (
        <div className="mt-2">
          <strong>🔐 AES Key (store securely):</strong>
          <div className="break-all text-sm mt-1 bg-gray-100 p-2 rounded">{encryptionKey}</div>
        </div>
      )}
    </form>
  );
};

export default NFTForm;
