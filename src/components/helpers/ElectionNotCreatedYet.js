import React from 'react';
import PropTypes from 'prop-types';

const ElectionNotCreatedYet = ({ createElection }) => {
    const handleCreateElection = () => {
        if (typeof createElection === 'function') {
            createElection();
        } else {
            console.error('createElection is not a function');
        }
    };

    return (
        <div>
            <h2>No Election Created</h2>
            <button onClick={handleCreateElection}>Create Election</button>
        </div>
    );
};

ElectionNotCreatedYet.propTypes = {
    createElection: PropTypes.func.isRequired,
};

export default ElectionNotCreatedYet;
