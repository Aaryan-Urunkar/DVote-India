import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const LoginUser = () => {
    const [voterIDNumber, setVoterIDNumber] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const voterIDRef = useRef('');

    const navigate = useNavigate();

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleVerifyVoterID = async () => {
        setError('');
        setVerificationResult(null);

        try {
            const requestOptions = {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmcmVlX3RpZXJfYWFyeWFuLnVydW5rYXIyM180ZDk1NmI5YjIwIiwiZXhwIjoxNzIyNDQ1NDY0fQ.x_cr6AkFAOveCxKmCxNt9qx-Ii-R0fNwz9PP36tJ0f4',
                    'x-api-key': '3cc6bc71398a49d9b955380a79798d11',
                    'Content-Type': 'application/json',
                },
                redirect: 'follow',
            };

            const response = await fetch(
                `https://production.deepvue.tech/v1/verification/post-voter-id?epic_number=${voterIDNumber}`,
                requestOptions
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();

            const requestID = result.request_id;

            if (requestID) {
                await pollVoterIDDetails(requestID);
            } else {
                throw new Error('No request_id returned from the first API call');
            }
        } catch (error) {
            console.error('Error verifying Voter ID:', error);
            setError(`Error: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarMessage(`Error: ${error.message}`);
            setSnackbarOpen(true);
        }
    };

    const pollVoterIDDetails = async (requestID) => {
        try {
            const requestOptions = {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmcmVlX3RpZXJfYWFyeWFuLnVydW5rYXIyM180ZDk1NmI5YjIwIiwiZXhwIjoxNzIyNDQ1NDY0fQ.x_cr6AkFAOveCxKmCxNt9qx-Ii-R0fNwz9PP36tJ0f4',
                    'x-api-key': '3cc6bc71398a49d9b955380a79798d11',
                    'Content-Type': 'application/json',
                },
                redirect: 'follow',
            };

            let pollingInterval = setInterval(async () => {
                try {
                    const response = await fetch(
                        `https://production.deepvue.tech/v1/verification/get-voter-id?request_id=${requestID}`,
                        requestOptions
                    );

                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    const responseData = await response.json();

                    if (Array.isArray(responseData) && responseData.length > 0) {
                        const firstResponse = responseData[0];
                        if (firstResponse.status === 'completed') {
                            clearInterval(pollingInterval);
                            setVerificationResult(firstResponse.result.source_output);
                            setSnackbarSeverity('success');
                            setSnackbarMessage('Verification successful!');
                            setSnackbarOpen(true);
                            handleVerificationSuccess();
                        } else if (firstResponse.status === 'error') {
                            clearInterval(pollingInterval);
                            setError(`Polling error: ${firstResponse.message}`);
                            setSnackbarSeverity('error');
                            setSnackbarMessage(`Polling error: ${firstResponse.message}`);
                            setSnackbarOpen(true);
                        }
                    } else {
                        throw new Error('Empty or unexpected response data');
                    }
                } catch (error) {
                    console.error('Error polling Voter ID details:', error);
                    clearInterval(pollingInterval);
                    setError(`Error: ${error.message}`);
                    setSnackbarSeverity('error');
                    setSnackbarMessage(`Error: ${error.message}`);
                    setSnackbarOpen(true);
                }
            }, 2000);
        } catch (error) {
            console.error('Error starting polling:', error);
            setError(`Error: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarMessage(`Error: ${error.message}`);
            setSnackbarOpen(true);
        }
    };

    const handleVerificationSuccess = () => {
        if (verificationResult && verificationResult.status === 'id_found') {
            navigate('/Voter-Dashboard', { state: { voterDetails: verificationResult } });
            voterIDRef.current.classList.remove('wrong');
        } else {
            setError('Verification failed. Please try again.');
            setSnackbarSeverity('error');
            setSnackbarMessage('Verification failed. Please try again.');
            setSnackbarOpen(true);
            voterIDRef.current.classList.add('wrong');
        }
    };

    return (
        <>
            <Navbar />
            <Box
                className='login-user-container'
                display='flex'
                flexDirection='column'
                justifyContent='center'
                alignItems='center'
                height='100vh'
                width='100vw'
                bgcolor='background.default'
            >
                <Box
                    className='login-box'
                    display='flex'
                    flexDirection='column'
                    alignItems='center'
                    justifyContent='center'
                    p={10}  
                    boxShadow={3}
                    borderRadius={10}
                    bgcolor='#d4941c'
                    width='60vw' 
                    maxWidth='800px' 
                    
                >
                    <h2 style={{ color: 'text.primary' }}>Voter ID Verification</h2>
                    <TextField
                        type='text'
                        name='VoterID'
                        inputRef={voterIDRef}
                        placeholder='Enter Voter ID Number'
                        value={voterIDNumber}
                        onChange={(e) => setVoterIDNumber(e.target.value)}
                        className='admin-login-input'
                        borderRadius={10}
                        variant='outlined'
                        fullWidth
                        margin='normal'
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'transparent', 
                                },
                                '&:hover fieldset': {
                                    borderColor: 'transparent', 
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'transparent', 
                                },
                            },
                            input: {
                                color: 'text.primary',
                                backgroundColor: 'background.paper',
                            },
                        }}
                    />

                    <Button
                        onClick={() => {
                            handleVerifyVoterID();
                        }}
                        className='user-login-button'
                        variant='contained'
                        color='primary'
                        size='large'
                        sx={{
                            mt: 2,
                            width: '50%', 
                            backgroundColor: 'blanchedalmond',
                            color: 'black',
                            height: '5vh',
                            fontFamily: 'Ubuntu Sans',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            '&:hover': {
                                backgroundColor: 'rgb(128,77,2)',
                                color: 'beige',
                            },
                        }}
                    >
                        Verify
                    </Button>
                </Box>
            </Box>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default LoginUser;
