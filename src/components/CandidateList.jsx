import React from 'react';
import { Button, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { styled } from '@mui/system';

const PaperStyled = styled(Paper)({
    padding: '16px',
    marginBottom: '16px',
});

const ListStyled = styled(List)({
    marginTop: '16px',
});

const CandidateList = ({ candidates, voteForCandidate }) => {
    return (
        <PaperStyled>
            <Typography variant="h6" gutterBottom>
                Candidate List
            </Typography>
            <ListStyled>
                {candidates.map((candidate, index) => (
                    <ListItem key={index} divider>
                        <ListItemText
                            primary={candidate.name}
                            secondary={`Party: ${candidate.party}`}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => voteForCandidate(candidate.party)}
                        >
                            Vote
                        </Button>
                    </ListItem>
                ))}
            </ListStyled>
        </PaperStyled>
    );
};

export default CandidateList;
