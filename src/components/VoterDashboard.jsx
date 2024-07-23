import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ElectionABI from './ElectionABI.json';
import CandidateList from './CandidateList';
import { keccak256, toUtf8Bytes } from 'ethers';

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
                name: candidate[0],
                party: candidate[1],
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

    const voteForCandidate = async (candidateName, candidateParty) => {
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
        <div>
            <h1>Voter Dashboard</h1>
            <button onClick={connectToMetaMask} disabled={loading}>
                {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect to MetaMask'}
            </button>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label>
                    Name:
                    <input type="text" value={voterName} onChange={(e) => setVoterName(e.target.value)} />
                </label>
                <label>
                    Aadhar Number:
                    <input type="text" value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value)} />
                </label>
            </div>
            <CandidateList candidates={candidates} voteForCandidate={voteForCandidate} />
        </div>
    );
};

export default VoterDashboard;
