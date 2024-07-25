import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import ElectionABI from './ElectionABI.json';
import ElectionBytecode from './ElectionBytecode.json'; 
import ElectionNotCreatedYet from './helpers/ElectionNotCreatedYet';
import ElectionMonitor from './helpers/ElectionMonitor';
import { Button, Typography, Container, Paper, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/system';

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
    backgroundColor: '#333333', 
    color: '#ffffff', 
    '&:hover': {
        backgroundColor: '#555555', 
    },
});

const AdminDashboard = ({ setElectionAddress, electionAddress }) => {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const checkExistingElection = useCallback((currentAccount) => {
        const accountToCheck = currentAccount || account;
        const existingElection = localStorage.getItem(accountToCheck);
        if (existingElection) {
            setElectionAddress(existingElection);
        }
    }, [account, setElectionAddress]);

    useEffect(() => {
        checkExistingElection();
    }, [account, checkExistingElection]);

    useEffect(() => {
        console.log('Current election address:', electionAddress);
    }, [electionAddress]);

    const connectToMetaMask = async () => {
        if (window.ethereum) {
            try {
                setLoading(true);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                checkExistingElection(accounts[0]);
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

    const createElection = async () => {
        if (!account) return alert('Please connect to MetaMask first.');

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const ElectionFactory = new ethers.ContractFactory(ElectionABI, ElectionBytecode.object, signer);

        try {
            setLoading(true);
            const electionContract = await ElectionFactory.deploy(account);
            await electionContract.waitForDeployment();

            const address = await electionContract.getAddress();
            localStorage.setItem(account, address);
            setElectionAddress(address);
        } catch (error) {
            console.error('Error deploying Election contract:', error);
            setError('Error deploying Election contract');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ContainerStyled>
            <PaperStyled>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4">Admin Dashboard</Typography>
                    <ButtonStyled onClick={connectToMetaMask} disabled={loading}>
                        {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect to MetaMask'}
                    </ButtonStyled>
                </div>
                {loading && <CircularProgress />}
                {error && <Alert severity="error">{error}</Alert>}
            </PaperStyled>

            {!electionAddress ? (
                <ElectionNotCreatedYet createElection={createElection} />
            ) : (
                <ElectionMonitor
                    electionAddress={electionAddress}
                    account={account}
                    setElectionAddress={setElectionAddress}
                />
            )}
        </ContainerStyled>
    );
};

export default AdminDashboard;
