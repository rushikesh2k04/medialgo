import React from 'react';
import MyProfile from './MyProfile';
import Marketplace from './Marketplace';
import Prescriptions from './Prescriptions';

const PatientDashboard: React.FC = () => {
  return (
    <div>
      <h1>Patient Dashboard</h1>
      <MyProfile />
      <Marketplace />
      <Prescriptions />
    </div>
  );
};

export default PatientDashboard;
