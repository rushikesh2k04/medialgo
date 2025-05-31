import React, { useState } from "react";

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

  const jwt =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmN2IwY2NjMC03ZTNmLTQ2NzUtYWUyYS01MTU3YjhiYjMyMGMiLCJlbWFpbCI6InJ1c2hpa2VzaDkuMjAwNEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNWE3YmU3MDkyYzc1MDBlZTkyMDkiLCJzY29wZWRLZXlTZWNyZXQiOiJhOTA3NDAwZDExYWI2ZTFmOGQ1NjlmZTgwYTFkYzZiMzJkZWU5YTk3ZGQwODUxMzBlMzZhMTRjMDViODNhZWNkIiwiZXhwIjoxNzc3ODUwNTUzfQ.DjmtmIocrDt_ydUJ_6imHL_0Ik4uxi1RRrX4MPwET1o";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      if (!imageFile || !pdfFile) throw new Error("Image and PDF required");

      const [imageCID, pdfCID] = await Promise.all([uploadToIPFS(imageFile), uploadToIPFS(pdfFile)]);

      const metadata = {
        name: title,
        description,
        image: `ipfs://${imageCID}`,
        pdf: `ipfs://${pdfCID}`,
        properties: {
          file_type: "nft_asset",
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
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <label className="label">NFT Title</label>
      <input className="input input-bordered" value={title} onChange={(e) => setTitle(e.target.value)} />

      <label className="label">Description</label>
      <textarea className="textarea textarea-bordered" value={description} onChange={(e) => setDescription(e.target.value)} />

      <label className="label">Upload Image</label>
      <input
        type="file"
        accept="image/*"
        className="file-input file-input-bordered"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
      />

      <label className="label">Upload PDF</label>
      <input
        type="file"
        accept=".pdf"
        className="file-input file-input-bordered"
        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
      />

      <button className={`btn mt-2 ${success ? "bg-green-500 text-white" : ""}`} type="submit" disabled={loading}>
        {loading ? "Uploading..." : success ? "Uploaded!" : "Upload to IPFS"}
      </button>
    </form>
  );
};

export default NFTForm;
