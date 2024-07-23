import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ElectionABI from './ElectionABI.json';
import ElectionBytecode from './ElectionBytecode.json'; 
import ElectionNotCreatedYet from './helpers/ElectionNotCreatedYet';
import ElectionMonitor from './helpers/ElectionMonitor';

const AdminDashboard = ({ setElectionAddress, electionAddress }) => {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkExistingElection();
    }, [account]);
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

    const checkExistingElection = (currentAccount) => {
        const accountToCheck = currentAccount || account;
        const existingElection = localStorage.getItem(accountToCheck);
        if (existingElection) {
            setElectionAddress(existingElection);
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
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Admin Dashboard</h1>
                <button onClick={connectToMetaMask} disabled={loading}>
                    {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect to MetaMask'}
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!electionAddress ? (
                <ElectionNotCreatedYet createElection={createElection} />
            ) : (
                <ElectionMonitor
                    electionAddress={electionAddress}
                    account={account}
                    setElectionAddress={setElectionAddress}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
