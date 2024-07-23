import React, { useState } from 'react';
import { ethers } from 'ethers';
import ElectionABI from '../ElectionABI.json';

const ElectionMonitor = ({ electionAddress, account, setElectionContractAddress }) => {
    const [candidateName, setCandidateName] = useState('');
    const [candidateParty, setCandidateParty] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            setCandidates(candidateList);
            console.log('Candidates fetched:', candidateList);
        } catch (error) {
            console.error('Error fetching candidates:', error);
            setError('Error fetching candidates');
        } finally {
            setLoading(false);
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
            alert('Winner declared successfully!');
        } catch (error) {
            console.error('Error declaring winner:', error);
            alert(`Error declaring winner: ${error.message}`);
        }
    };

    const resetElection = () => {
        localStorage.removeItem(account);
        setElectionContractAddress(null);
    };

    return (
        <div>
            <h2>Election Monitor</h2>
            <p>Contract Address: {electionAddress}</p>
            <div>
                <input
                    type="text"
                    placeholder="Candidate Name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Candidate Party"
                    value={candidateParty}
                    onChange={(e) => setCandidateParty(e.target.value)}
                />
                <button onClick={addCandidate}>Add Candidate</button>
            </div>
            <button onClick={fetchCandidates}>Fetch Candidates</button>
            <button onClick={endElection}>End Election</button>
            <button onClick={declareWinner}>Declare Winner</button>
            <button onClick={resetElection}>Reset Election</button>
            <div>
                <h3>Candidates List:</h3>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <ul>
                        {candidates.map((candidate, index) => (
                            <li key={index}>
                                Name: {candidate.name}, Party: {candidate.party}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ElectionMonitor;
