import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import Homepage from './components/Homepage';
import LoginUser from './components/LoginUser';
import LoginAdmin from './components/LoginAdmin';
import VoterDashboard from './components/VoterDashboard';
import AdminDashboard from './components/AdminDashboard';
import AboutUs from './components/AboutUs';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
        },
        secondary: {
            main: '#f48fb1',
        },
        background: {
            default: '#121212', 
            paper: '#1d1d1d',
        },
        text: {
            primary: '#ffffff',
        },
    },
});

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
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Router>
                <Container
                    maxWidth="lg"
                    sx={{
                        marginTop: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '0',
                        minHeight: '100vh',
                        bgcolor: 'background.default', 
                    }}
                >
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/LoginUser" element={<LoginUser />} />
                        <Route path="/LoginAdmin" element={<LoginAdmin />} />
                        <Route path="/Voter-Dashboard" element={<VoterDashboard electionAddress={electionAddress} />} />
                        <Route path="/Admin-Dashboard" element={<AdminDashboard setElectionAddress={handleSetElectionAddress} electionAddress={electionAddress} />} />
                        <Route path="/aboutus" element={<AboutUs />} />
                    </Routes>
                </Container>
            </Router>
        </ThemeProvider>
    );
};

export default App;
