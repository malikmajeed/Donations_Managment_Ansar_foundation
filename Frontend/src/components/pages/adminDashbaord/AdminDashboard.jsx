import React, { useState } from 'react';
import {  Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import AllStudents from './AllStudents'; // (to be created)
import Education from './Education';
import Empowerment from './Empowerment';
import FoodDistribution from './FoodDistribution';
import MobileClinic from './MobileClinic';
import WaterWells from './WaterWells';

const profile = {
  name: 'Admin User',
  image: 'https://randomuser.me/api/portraits/men/32.jpg'
};

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* Header Bar */}
        <div className="sticky top-0 bg-white shadow-sm border-b border-gray-200 px-6 py-2 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={profile.image} alt="Profile" className="w-8 h-8 rounded-full" />
              <span className="font-semibold text-gray-900">{profile.name}</span>
            </div>
            <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
              Logout
            </button>
          </div>
        </div>
        
        {/* Main Content Area with Padding */}
        <div className="p-4">
          <Routes>
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='students' element={<AllStudents />} />
            <Route path='education' element={<Education />} />
            <Route path='empowerment' element={<Empowerment />} />
            <Route path='food-distribution' element={<FoodDistribution CauseType="foodDistribution" />} />
            <Route path='mobile-clinic' element={<MobileClinic />} />
            <Route path='water-wells' element={<WaterWells />} />
          </Routes>
        </div>
      </div>
    </div>
  );
} 