import React from 'react';

const CandidateList = ({ candidates, voteForCandidate }) => {
    return (
        <div>
            <h2>Candidates</h2>
            {candidates.length > 0 ? (
                candidates.map((candidate, index) => (
                    <div key={index}>
                        <p>Candidate Name: {candidate.name}</p>
                        <p>Party: {candidate.party}</p>
                        <button onClick={() => voteForCandidate(candidate.name, candidate.party)}>
                            Vote
                        </button>
                    </div>
                ))
            ) : (
                <p>No candidates available.</p>
            )}
        </div>
    );
};

export default CandidateList;
