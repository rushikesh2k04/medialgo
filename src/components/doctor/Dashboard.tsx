import React from 'react';
import Navigation from '../common/Navigation';
import MyProfile from './MyProfile';
import MedicalServices from './MedicalServices';
import Marketplace from './Marketplace';

const DoctorDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Doctor Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-8">
          <section id="profile" className="bg-white rounded-lg shadow-md p-6">
            <MyProfile />
          </section>

          <section id="services" className="bg-white rounded-lg shadow-md p-6">
            <MedicalServices />
          </section>

          <section id="marketplace" className="bg-white rounded-lg shadow-md p-6">
            <Marketplace />
          </section>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;