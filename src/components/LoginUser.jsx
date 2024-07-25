import { wait } from '@testing-library/user-event/dist/utils';
import React, { useState , useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import "./css/LoginUser.css";

const LoginUser = () => {
    const [voterIDNumber, setVoterIDNumber] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [error, setError] = useState('');

    const voterIDRef = useRef('');

    const navigate = useNavigate();
    const handleVerifyVoterID = async () => {
        setError('');
        setVerificationResult(null);

        try {
            const requestOptions = {
                method: 'POST',
                headers: {
                    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmcmVlX3RpZXJfdmFydW4uamhhdmVyaTIzX2EyMmZkNDdjYzIiLCJleHAiOjE3MjEzMjE1Njl9.FGKLtxxMBRAouvmH3yptj-gHpCviftGeI8IHZMryQ9U",
                    "x-api-key": "5fdf06b68ae74d45b74d1332623dfaeb",
                    "Content-Type": "application/json"
                },
                redirect: 'follow'
            };

            const response = await fetch(`https://production.deepvue.tech/v1/verification/post-voter-id?epic_number=${voterIDNumber}`, requestOptions);

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
        }
    };

    const pollVoterIDDetails = async (requestID) => {
        try {
            const requestOptions = {
                method: 'GET',
                headers: {
                    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmcmVlX3RpZXJfdmFydW4uamhhdmVyaTIzX2EyMmZkNDdjYzIiLCJleHAiOjE3MjEzMjE1Njl9.FGKLtxxMBRAouvmH3yptj-gHpCviftGeI8IHZMryQ9U",
                    "x-api-key": "5fdf06b68ae74d45b74d1332623dfaeb",
                    "Content-Type": "application/json"
                },
                redirect: 'follow'
            };
    
            let pollingInterval = setInterval(async () => {
                try {
                    const response = await fetch(`https://production.deepvue.tech/v1/verification/get-voter-id?request_id=${requestID}`, requestOptions);
    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
    
                    const responseData = await response.json();
    
                    if (Array.isArray(responseData) && responseData.length > 0) {
                        const firstResponse = responseData[0];
                        if (firstResponse.status === 'completed') {
                            clearInterval(pollingInterval);
                            setVerificationResult(firstResponse.result.source_output);
                        } else if (firstResponse.status === 'error') {
                            clearInterval(pollingInterval);
                            setError(`Polling error: ${firstResponse.message}`);
                        }
                    } else {
                        throw new Error('Empty or unexpected response data');
                    }
                } catch (error) {
                    console.error('Error polling Voter ID details:', error);
                    clearInterval(pollingInterval);
                    setError(`Error: ${error.message}`);
                }
            }, 2000); 
        } catch (error) {
            console.error('Error starting polling:', error);
            setError(`Error: ${error.message}`);
        }
    };
    const handleVerificationSuccess = () => {
        if (verificationResult && verificationResult.status === 'id_found') {
            navigate('/Voter-Dashboard', { state: { voterDetails: verificationResult } });
            voterIDRef.current.classList.add("wrong");
        } else {
            setError('Verification failed. Please try again.');
            voterIDRef.current.classList.add("wrong");
        }
    };

    

    return (
        <>
            <Navbar></Navbar>
            <div className='login-user-container'>
                <div className='login-box'> { /*login-box CSS not present in LoginUser.css file but instead in LoginAdmin.css file*/}
                    <h2>Voter ID Verification</h2>
                    <input
                        type="text"
                        name='VoterID'
                        ref={voterIDRef}
                        placeholder="Enter Voter ID Number"
                        value={voterIDNumber}
                        onChange={(e) => setVoterIDNumber(e.target.value)}
                        className='admin-login-input' 
                        />
                    <br /> {/*admin-login-input CSS not present in LoginUser.css file but instead in LoginAdmin.css file */}
                    <motion.button
                        onClick={() => {
                            handleVerifyVoterID();
                            pollVoterIDDetails();
                            wait(2000)
                            handleVerificationSuccess(); 
                        }}
                        className = "user-login-button"
                        whileTap={{
                            scale:"0.8",                            
                        }}
                        whileHover={{
                            backgroundColor:"rgb(128,77,2)" ,
                            color:"beige"
                        }}
                        transition={{
                            duration:"0.5"
                        }}
                        >
                        Verify
                    </motion.button>
                    <div >
                        {error && <p>{error}</p>}
                        {verificationResult && (
                            <div>
                                <h3>Verification Results</h3>
                                <ul >
                                    <li><strong>AC No:</strong> {verificationResult.ac_no}</li>
                                    <li><strong>Date of Birth:</strong> {verificationResult.date_of_birth}</li>
                                    <li><strong>District:</strong> {verificationResult.district}</li>
                                    <li><strong>Gender:</strong> {verificationResult.gender}</li>
                                    <li><strong>status:</strong> {verificationResult.status}</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginUser;
