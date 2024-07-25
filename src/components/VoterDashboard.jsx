import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ElectionABI from './ElectionABI.json';
import CandidateList from './CandidateList';
import { Button, TextField, Typography, Container, Paper, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/system';

const ContainerStyled = styled(Container)({
    marginTop: '16px',
    padding: '16px',
});

const PaperStyled = styled(Paper)({
    padding: '16px',
    marginBottom: '16px',
    textAlign: 'center',
});

const ButtonStyled = styled(Button)({
    margin: '8px',
});

const InputStyled = styled(TextField)({
    margin: '8px',
    width: '100%',
});

const VoterDashboard = ({ electionAddress }) => {
    const [account, setAccount] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [voterName, setVoterName] = useState('');
    const [aadharNumber, setAadharNumber] = useState('');

    useEffect(() => {
        connectToMetaMask();
    }, []);

    const connectToMetaMask = async () => {
        if (window.ethereum) {
            try {
                setLoading(true);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                fetchCandidates();
            } catch (error) {
                console.error('Failed to connect to MetaMask', error);
                setError('Failed to connect to MetaMask');
            } finally {
                setLoading(false);
            }
        } else {
            alert('MetaMask is not installed. Please install it to use this feature.');
        }
    };

    const fetchCandidates = async () => {
        if (!electionAddress) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const electionContract = new ethers.Contract(electionAddress, ElectionABI, provider);

        try {
            setLoading(true);
            console.log('Fetching candidates from contract at:', electionAddress);
            const candidateList = await electionContract.getCandidates();

            console.log('Raw candidate data:', candidateList);

            const mappedCandidates = candidateList.map(candidate => ({
                name: candidate.name,
                party: candidate.politicalParty,
            }));

            console.log('Candidates fetched:', mappedCandidates);
            setCandidates(mappedCandidates);
        } catch (error) {
            console.error('Error fetching candidates:', error);
            setError('Error fetching candidates');
        } finally {
            setLoading(false);
        }
    };

    const voteForCandidate = async (candidateParty) => {
        if (!account || !voterName || !aadharNumber) return alert('Please fill in all details and connect to MetaMask first.');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const electionContract = new ethers.Contract(electionAddress, ElectionABI, signer);

        try {
            setLoading(true);
            
            const tx = await electionContract.vote(voterName, aadharNumber, candidateParty);
            await tx.wait();

            alert('Vote cast successfully!');
        } catch (error) {
            console.error('Error casting vote:', error);
            setError('Error casting vote');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ContainerStyled>
            <Typography variant="h4" gutterBottom>Voter Dashboard</Typography>
            <PaperStyled>
                <Typography variant="h6">
                    {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect to MetaMask'}
                </Typography>
                <ButtonStyled
                    variant="contained"
                    color="primary"
                    onClick={connectToMetaMask}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Connect to MetaMask'}
                </ButtonStyled>
            </PaperStyled>
            {error && <Alert severity="error">{error}</Alert>}
            <PaperStyled>
                <Typography variant="h6">Vote for a Candidate</Typography>
                <InputStyled
                    label="Name"
                    variant="outlined"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                />
                <InputStyled
                    label="Aadhar Number"
                    variant="outlined"
                    value={aadharNumber}
                    onChange={(e) => setAadharNumber(e.target.value)}
                />
            </PaperStyled>
            <CandidateList candidates={candidates} voteForCandidate={voteForCandidate} />
        </ContainerStyled>
    );
};

export default VoterDashboard;
