import React, { useState, useEffect } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { useUser } from "./contexts/UserContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import ConnectWallet from "./components/ConnectWallet";
import "./styles/Home.css";

const Home: React.FC = () => {
  const { setRole, setWalletAddress } = useUser();
  const { activeAccount, activeAddress } = useWallet();
  const [openWalletModal, setOpenWalletModal] = useState(false);
  const navigate = useNavigate();

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal);

  const handleRoleSelection = (role: "doctor" | "patient" | "pharmacy") => {
    setRole(role);
    setWalletAddress(activeAddress || "");
    navigate("/profile"); // Redirect to profile setup
  };

  useEffect(() => {
    if (activeAddress) {
      setWalletAddress(activeAddress);
    }
  }, [activeAddress, setWalletAddress]);

  return (
    <div className="home-container">
      <div className="form-card">
        <h1>Welcome to MedicalNFT</h1>
        <button className="wallet-btn" onClick={toggleWalletModal}>
          Wallet Connection
        </button>

        {activeAccount && (
          <div className="role-selection">
            <p>Select your role:</p>
            <button onClick={() => handleRoleSelection("doctor")}>Doctor</button>
            <button onClick={() => handleRoleSelection("patient")}>Patient</button>
            <button onClick={() => handleRoleSelection("pharmacy")}>Pharmacy</button>
          </div>
        )}

        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    </div>
  );
};

export default Home;
