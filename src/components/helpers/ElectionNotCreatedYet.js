import React from 'react';
import PropTypes from 'prop-types';
import { Button, Typography, Paper, Container } from '@mui/material';
import { styled } from '@mui/system';

const ContainerStyled = styled(Container)({
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#121212', 
    color: '#ffffff', 
    textAlign: 'center',
});

const PaperStyled = styled(Paper)({
    padding: '16px',
    backgroundColor: '#1f1f1f', 
    color: '#ffffff', 
    marginBottom: '16px',
});

const ButtonStyled = styled(Button)({
    marginTop: '16px',
    backgroundColor: '#333333', 
    color: '#ffffff', 
    '&:hover': {
        backgroundColor: '#555555', 
    },
});

const ElectionNotCreatedYet = ({ createElection }) => {
    const handleCreateElection = () => {
        if (typeof createElection === 'function') {
            createElection();
        } else {
            console.error('createElection is not a function');
        }
    };

    return (
        <ContainerStyled>
            <PaperStyled>
                <Typography variant="h4" gutterBottom>No Election Created</Typography>
                <ButtonStyled
                    variant="contained"
                    onClick={handleCreateElection}
                >
                    Create Election
                </ButtonStyled>
            </PaperStyled>
        </ContainerStyled>
    );
};

ElectionNotCreatedYet.propTypes = {
    createElection: PropTypes.func.isRequired,
};

export default ElectionNotCreatedYet;
