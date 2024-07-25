import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ElectionABI from '../ElectionABI.json';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Button, TextField, Typography, Container, Paper, CircularProgress, List, ListItem, ListItemText, IconButton, Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';

const ContainerStyled = styled(Container)({
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#121212', 
    color: '#ffffff', 
});

const PaperStyled = styled(Paper)({
    padding: '16px',
    textAlign: 'center',
    marginBottom: '16px',
    backgroundColor: '#1f1f1f', 
    color: '#ffffff', 
});

const ButtonStyled = styled(Button)({
    margin: '8px',
});

const InputStyled = styled(TextField)({
    margin: '8px',
    width: 'calc(100% - 16px)',
});

const PieChartStyled = styled('div')({
    marginTop: '16px',
});

const ListStyled = styled(List)({
    maxHeight: 300,
    overflow: 'auto',
    backgroundColor: '#1f1f1f', 
    borderRadius: '4px', 
    padding: '8px', 
});

const ListItemStyled = styled(ListItem)({
    display: 'flex',
    alignItems: 'center',
    color: '#ffffff', 
    borderBottom: '1px solid #333333', 
    padding: '8px',
    backgroundColor: '#2c2c2c', 
});

const ElectionMonitor = ({ electionAddress, account, setElectionAddress }) => {
    const [candidateName, setCandidateName] = useState('');
    const [candidateParty, setCandidateParty] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const getProviderAndSigner = async () => {
        if (!window.ethereum) {
            showSnackbar('MetaMask is not installed!', 'error');
            return null;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return { provider, signer };
    };

    const addCandidate = async () => {
        if (!candidateName || !candidateParty) return showSnackbar('Please enter candidate details.', 'error');

        const { provider, signer } = await getProviderAndSigner();
        if (!provider || !signer) return;

        const electionContract = new ethers.Contract(electionAddress, ElectionABI, signer);

        try {
            const tx = await electionContract.addCandidate(candidateName, candidateParty);
            await tx.wait();
            showSnackbar('Candidate added successfully!', 'success');
        } catch (error) {
            console.error('Error adding candidate:', error);
            showSnackbar(`Error adding candidate: ${error.reason || error.message}`, 'error');
        }
    };

    const fetchCandidates = async () => {
        const { provider } = await getProviderAndSigner();
        if (!provider) return;

        const electionContract = new ethers.Contract(electionAddress, ElectionABI, provider);

        try {
            setLoading(true);
            const candidateList = await electionContract.getCandidates();
            setCandidates(candidateList.map(candidate => ({
                name: candidate.name,
                party: candidate.politicalParty,
                votes: Number(candidate.votes) 
            })));
        } catch (error) {
            console.error('Error fetching candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    const startElection = async () => {
        const { provider, signer } = await getProviderAndSigner();
        if (!provider || !signer) return;

        const electionContract = new ethers.Contract(electionAddress, ElectionABI, signer);

        try {
            const tx = await electionContract.startElection();
            await tx.wait();
            showSnackbar('Election started successfully!', 'success');
        } catch (error) {
            console.error('Error starting election:', error);
            showSnackbar(`Error starting election: ${error.message}`, 'error');
        }
    };

    const endElection = async () => {
        const { provider, signer } = await getProviderAndSigner();
        if (!provider || !signer) return;

        const electionContract = new ethers.Contract(electionAddress, ElectionABI, signer);

        try {
            const tx = await electionContract.endElection();
            await tx.wait();
            showSnackbar('Election ended successfully!', 'success');
        } catch (error) {
            console.error('Error ending election:', error);
            showSnackbar(`Error ending election: ${error.message}`, 'error');
        }
    };

    const declareWinner = async () => {
        const { provider, signer } = await getProviderAndSigner();
        if (!provider || !signer) return;

        const electionContract = new ethers.Contract(electionAddress, ElectionABI, signer);

        try {
            const tx = await electionContract.declareWinner();
            await tx.wait();

            const [winnerNames, winningParties, maxVotes] = await electionContract.getWinnerDetails();
            showSnackbar(`Winner declared: ${winnerNames[0]} (${winningParties[0]}) with ${maxVotes[0]} votes!`, 'success');

            const chartData = candidates.map(candidate => ({
                name: `${candidate.name} (${candidate.party})`,
                votes: candidate.votes
            }));

            setChartData(chartData);
        } catch (error) {
            console.error('Error declaring winner:', error);
            showSnackbar(`Error declaring winner: ${error.message}`, 'error');
        }
    };

    const resetElection = () => {
        localStorage.removeItem(account);
        setElectionAddress(null);
    };
    
    const handleDeleteCandidate = async (party) => {
        if (!window.confirm(`Are you sure you want to delete the candidate from party: ${party}?`)) return;

        const { provider, signer } = await getProviderAndSigner();
        if (!provider || !signer) return;

        const electionContract = new ethers.Contract(electionAddress, ElectionABI, signer);

        try {
            const tx = await electionContract.removeCandidate(party);
            await tx.wait();
            showSnackbar('Candidate removed successfully!', 'success');
            
            fetchCandidates();
        } catch (error) {
            console.error('Error removing candidate:', error);
            showSnackbar(`Error removing candidate: ${error.reason || error.message}`, 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    useEffect(() => {
        fetchCandidates();

        const intervalId = setInterval(() => {
            fetchCandidates();
        }, 10000);

        return () => clearInterval(intervalId);
    }, [electionAddress]);

    return (
        <ContainerStyled>
            <Typography variant="h4" gutterBottom>Election Monitor</Typography>
            
            <div>
                <InputStyled
                    label="Candidate Name"
                    variant="outlined"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                />
                <InputStyled
                    label="Candidate Party"
                    variant="outlined"
                    value={candidateParty}
                    onChange={(e) => setCandidateParty(e.target.value)}
                />
                <ButtonStyled
                    variant="contained"
                    color="primary"
                    onClick={addCandidate}
                >
                    Add Candidate
                </ButtonStyled>
            </div>
            <div>
                <ButtonStyled
                    variant="contained"
                    color="secondary"
                    onClick={fetchCandidates}
                >
                    Fetch Candidates
                </ButtonStyled>
                <ButtonStyled
                    variant="contained"
                    color="success"
                    onClick={startElection}
                >
                    Start Election
                </ButtonStyled>
                <ButtonStyled
                    variant="contained"
                    color="warning"
                    onClick={endElection}
                >
                    End Election
                </ButtonStyled>
                <ButtonStyled
                    variant="contained"
                    color="info"
                    onClick={declareWinner}
                >
                    Declare Winner
                </ButtonStyled>
                <ButtonStyled
                    variant="contained"
                    color="error"
                    onClick={resetElection}
                >
                    Reset Election
                </ButtonStyled>
            </div>
            <div>
                <Typography variant="h6">Candidates List:</Typography>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <ListStyled>
                        {candidates.map((candidate, index) => (
                            <ListItemStyled key={index}>
                                <ListItemText primary={`Name: ${candidate.name}`} secondary={`Party: ${candidate.party}, Votes: ${candidate.votes}`} />
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteCandidate(candidate.party)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemStyled>
                        ))}
                    </ListStyled>
                )}
            </div>
            {chartData.length > 0 && (
                <PieChartStyled>
                    <PieChart width={400} height={400}>
                        <Pie
                            data={chartData}
                            dataKey="votes"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={150}
                            fill="#8884d8"
                            label
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </PieChartStyled>
            )}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </ContainerStyled>
    );
};

export default ElectionMonitor;
