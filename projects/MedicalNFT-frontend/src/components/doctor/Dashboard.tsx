import React from 'react';
import MyProfile from './MyProfile';
import MedicalServices from './MedicalServices';
import Marketplace from './Marketplace';

const DoctorDashboard: React.FC = () => {
  return (
    <div>
      <h1>Doctor Dashboard</h1>
      <MyProfile />
      <MedicalServices />
      <Marketplace />
    </div>
  );
};

export default DoctorDashboard;
