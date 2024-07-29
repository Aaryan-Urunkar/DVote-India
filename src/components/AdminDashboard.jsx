import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom'; 
import ElectionABI from './ElectionABI.json';
import ElectionBytecode from './ElectionBytecode.json'; 
import ElectionNotCreatedYet from './helpers/ElectionNotCreatedYet';
import ElectionMonitor from './helpers/ElectionMonitor';
import {
  Button,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
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

const StatusIndicator = styled(Typography)(({ status }) => ({
  color: status === 'open' ? 'green' : 'red',
  fontWeight: 'bold',
  position: 'absolute',
  top: 16,
  right: 16,
}));

const MaskedAddress = styled(Typography)(({ blurred }) => ({
  display: 'inline',
  cursor: 'pointer',
  fontWeight: 'bold',
  color: '#ffffff',
  filter: blurred ? 'blur(3px)' : 'none',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}));

const AdminDashboard = ({ setElectionAddress, electionAddress }) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [electionStatus, setElectionStatus] = useState(() => localStorage.getItem('electionStatus'));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmRevealOpen, setConfirmRevealOpen] = useState(false); 
  const [showFullAddress, setShowFullAddress] = useState(false);

  const navigate = useNavigate(); 

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
    if (electionAddress) {
      fetchElectionStatus();
      const interval = setInterval(fetchElectionStatus, 2000);
      return () => clearInterval(interval); 
    }
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
        showSnackbar('Failed to connect to MetaMask', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      showSnackbar('MetaMask is not installed. Please install it to use this feature.', 'error');
    }
  };

  const createElection = async () => {
    if (!account) return showSnackbar('Please connect to MetaMask first.', 'error');

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
      showSnackbar('Election created successfully!', 'success');
    } catch (error) {
      console.error('Error deploying Election contract:', error);
      showSnackbar('Error deploying Election contract', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchElectionStatus = async () => {
    if (!electionAddress) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const electionContract = new ethers.Contract(electionAddress, ElectionABI, provider);

    try {
      const status = await electionContract.getElectionStatus();
      const statusText = status === 0n ? 'open' : 'closed'; 
      setElectionStatus(statusText);
      localStorage.setItem('electionStatus', statusText);
    } catch (error) {
      console.error('Error fetching election status:', error);
      showSnackbar('Error fetching election status', 'error');
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

  const handleLogout = () => {
    localStorage.removeItem(account);
    setAccount(null);
    setElectionAddress(null);
    navigate('/');
  };

  const handleRevealAddress = () => {
    if (showFullAddress) {
      setShowFullAddress(false);
    } else {
      setConfirmRevealOpen(true); 
    }
  };

  const handleConfirmReveal = () => {
    setShowFullAddress(true);
    setConfirmRevealOpen(false);
  };

  const handleCancelReveal = () => {
    setConfirmRevealOpen(false);
  };

  useEffect(() => {
    window.showSnackbar = showSnackbar;
  }, []);

  return (
    <ContainerStyled>
      {electionStatus !== null && (
        <StatusIndicator status={electionStatus}>
          {electionStatus === 'open' ? 'Voting is Open' : 'Voting is Closed'}
        </StatusIndicator>
      )}
      <PaperStyled>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Admin Dashboard</Typography>
          <ButtonStyled onClick={connectToMetaMask} disabled={loading}>
            {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect to MetaMask'}
          </ButtonStyled>
          {account && (
            <ButtonStyled onClick={handleLogout}>
              Logout
            </ButtonStyled>
          )}
        </div>
        {loading && <CircularProgress />}
      </PaperStyled>

      {electionAddress && (
        <PaperStyled>
          <Typography variant="h6">
            Election Contract Address: 
            <MaskedAddress blurred={!showFullAddress} onClick={handleRevealAddress}>
              {showFullAddress ? electionAddress : `${electionAddress.slice(0, 6)}...${electionAddress.slice(-4)}`}
            </MaskedAddress>
          </Typography>
        </PaperStyled>
      )}

      {!electionAddress ? (
        <ElectionNotCreatedYet createElection={createElection} />
      ) : (
        <ElectionMonitor
          electionAddress={electionAddress}
          account={account}
          setElectionAddress={setElectionAddress}
        />
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={confirmRevealOpen}
        onClose={handleCancelReveal}
      >
        <DialogTitle>Confirm Reveal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reveal the full contract address? 
            <br />
            <strong>Warning:</strong> Revealing this address to unauthorized individuals can compromise security. Use this information only for security and debugging purposes.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelReveal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmReveal} color="primary">
            Reveal
          </Button>
        </DialogActions>
      </Dialog>
    </ContainerStyled>
  );
};

export default AdminDashboard;
