import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css";
import Homepage from './components/Homepage';
import LoginUser from './components/LoginUser';
import LoginAdmin from './components/LoginAdmin';
import VoterDashboard from './components/VoterDashboard';
import AdminDashboard from './components/AdminDashboard';
import AboutUs from './components/AboutUs';

const App = () => {
  const [electionAddress, setElectionAddress] = useState(null);

  useEffect(() => {
    const storedAddress = localStorage.getItem('electionAddress');
    if (storedAddress) {
      setElectionAddress(storedAddress);
    }
  }, []);

  const handleSetElectionAddress = (address) => {
    setElectionAddress(address);
    localStorage.setItem('electionAddress', address);
  };

  return (
    <Router>
      <div className='background title'>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/LoginUser" element={<LoginUser />} />
          <Route path="/LoginAdmin" element={<LoginAdmin />} />
          <Route path="/Voter-Dashboard" element={<VoterDashboard electionAddress={electionAddress} />} />
          <Route path="/Admin-Dashboard" element={<AdminDashboard setElectionAddress={handleSetElectionAddress} electionAddress={electionAddress} />} />
          <Route path="/aboutus" element={<AboutUs />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
