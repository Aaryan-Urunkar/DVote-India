import React, { useState } from 'react';
import { ethers } from 'ethers';
import ElectionABI from '../ElectionABI.json';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Button, TextField, Typography, Container, Paper, CircularProgress, List, ListItem, ListItemText, IconButton } from '@mui/material';
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
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const getProviderAndSigner = async () => {
        if (!window.ethereum) {
            alert('MetaMask is not installed!');
            return null;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return { provider, signer };
    };

    const addCandidate = async () => {
        if (!candidateName || !candidateParty) return alert('Please enter candidate details.');

        const { provider, signer } = await getProviderAndSigner();
        if (!provider || !signer) return;

        const electionContract = new ethers.Contract(electionAddress, ElectionABI, signer);

        try {
            const tx = await electionContract.addCandidate(candidateName, candidateParty);
            await tx.wait();
            alert('Candidate added successfully!');
        } catch (error) {
            console.error('Error adding candidate:', error);
            alert(`Error adding candidate: ${error.reason || error.message}`);
        }
    };

    const fetchCandidates = async () => {
        const { provider } = await getProviderAndSigner();
        if (!provider) return;

        console.log('Using contract address:', electionAddress);

        const electionContract = new ethers.Contract(electionAddress, ElectionABI, provider);

        try {
            setLoading(true);
            const candidateList = await electionContract.getCandidates();
            console.log('Raw candidates fetched:', candidateList);

            setCandidates(candidateList.map(candidate => ({
                name: candidate.name,
                party: candidate.politicalParty,
                votes: Number(candidate.votes) 
            })));
            console.log('Processed candidates:', candidates);
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
            alert('Election started successfully!');
        } catch (error) {
            console.error('Error starting election:', error);
            alert(`Error starting election: ${error.message}`);
        }
    };

    const endElection = async () => {
        const { provider, signer } = await getProviderAndSigner();
        if (!provider || !signer) return;

        const electionContract = new ethers.Contract(electionAddress, ElectionABI, signer);

        try {
            const tx = await electionContract.endElection();
            await tx.wait();
            alert('Election ended successfully!');
        } catch (error) {
            console.error('Error ending election:', error);
            alert(`Error ending election: ${error.message}`);
        }
    };

    const declareWinner = async () => {
        const { provider, signer } = await getProviderAndSigner();
        if (!provider || !signer) return;

        const electionContract = new ethers.Contract(electionAddress, ElectionABI, signer);

        try {
            const tx = await electionContract.declareWinner();
            await tx.wait();

            // Now fetch the winner details
            const [winnerNames, winningParties, maxVotes] = await electionContract.getWinnerDetails();
            alert(`Winner declared: ${winnerNames[0]} (${winningParties[0]}) with ${maxVotes[0]} votes!`);

            // Prepare data for the pie chart
            const chartData = candidates.map(candidate => ({
                name: `${candidate.name} (${candidate.party})`,
                votes: candidate.votes
            }));

            setChartData(chartData);
        } catch (error) {
            console.error('Error declaring winner:', error);
            alert(`Error declaring winner: ${error.message}`);
        }
    };

    const resetElection = () => {
        localStorage.removeItem(account);
        setElectionAddress(null);
    };
//YO I SITLL NEED TRO WORK ON THIS LMAO
    const handleDeleteCandidate = (name) => {
        alert(`Delete candidate: ${name}`);
    };

    return (
        <ContainerStyled>
            <Typography variant="h4" gutterBottom>Election Monitor</Typography>
            <PaperStyled>
                <Typography variant="h6">Contract Address: {electionAddress}</Typography>
            </PaperStyled>
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
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteCandidate(candidate.name)}>
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
        </ContainerStyled>
    );
};

export default ElectionMonitor;
