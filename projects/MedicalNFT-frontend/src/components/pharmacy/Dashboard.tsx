import React from 'react';
import MyProfile from './MyProfile';
import Marketplace from './Marketplace';
import PatientPrescriptions from './PatientPrescriptions';

const PharmacyDashboard: React.FC = () => {
  return (
    <div>
      <h1>Pharmacy Dashboard</h1>
      <MyProfile />
      <Marketplace />
      <PatientPrescriptions />
    </div>
  );
};

export default PharmacyDashboard;
