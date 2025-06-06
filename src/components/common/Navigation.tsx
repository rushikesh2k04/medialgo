import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { useWallet } from '@txnlab/use-wallet-react';
import { ellipseAddress } from '../../utils/ellipseAddress';

const Navigation: React.FC = () => {
  const { role, setRole } = useUser();
  const { activeAddress, disconnect } = useWallet();

  const handleLogout = () => {
    disconnect();
    setRole(null);
  };

  return (
    <nav className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">MedicalNFT</div>
        
        <div className="flex items-center space-x-6">
          {role === 'doctor' && (
            <div className="text-white space-x-4">
              <a href="#profile\" className="hover:text-teal-200">Profile</a>
              <a href="#services" className="hover:text-teal-200">Services</a>
              <a href="#marketplace" className="hover:text-teal-200">Marketplace</a>
            </div>
          )}
          
          {role === 'patient' && (
            <div className="text-white space-x-4">
              <a href="#profile" className="hover:text-teal-200">Profile</a>
              <a href="#prescriptions" className="hover:text-teal-200">Prescriptions</a>
              <a href="#marketplace" className="hover:text-teal-200">Marketplace</a>
            </div>
          )}
          
          {role === 'pharmacy' && (
            <div className="text-white space-x-4">
              <a href="#profile" className="hover:text-teal-200">Profile</a>
              <a href="#prescriptions" className="hover:text-teal-200">Patient Prescriptions</a>
              <a href="#marketplace" className="hover:text-teal-200">Marketplace</a>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <span className="text-teal-200">{ellipseAddress(activeAddress)}</span>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;