import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const LoginAdmin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [incorrectDetails, setIncorrectDetails] = useState(false);

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    const navigate = useNavigate();

    const handleLogin = () => {
        if (username === 'admin' && password === 'tester') {
            usernameRef.current.classList.remove('wrong');
            passwordRef.current.classList.remove('wrong');
            setIncorrectDetails(false);
            console.log('Login successful');
            navigate('/Admin-Dashboard');
        } else {
            console.log(usernameRef);
            usernameRef.current.classList.add('wrong');
            passwordRef.current.classList.add('wrong');
            setIncorrectDetails(true);
        }
    };

    return (
        <>
            <Navbar />
            <Box
                className='admin-login-container'
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
                    p={5}
                    boxShadow={3}
                    borderRadius={10}
                    bgcolor='#d4941c'
                    width='40vw'
                    maxWidth='500px'
                >
                    <Typography variant='h4' color='text.primary'>
                        Login
                    </Typography>
                    <TextField
                        ref={usernameRef}
                        name='username'
                        type='text'
                        placeholder='Username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className='admin-login-input'
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
                    <TextField
                        ref={passwordRef}
                        name='password'
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='admin-login-input'
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
                    {incorrectDetails && (
                        <Typography variant='body2' color='error' className='wrong'>
                            Incorrect details entered. Please try again.
                        </Typography>
                    )}
                    <motion.div
                        whileTap={{ scale: 0.8 }}
                        whileHover={{
                            backgroundColor: 'rgb(128,77,2)',
                            color: 'beige',
                        }}
                        transition={{ duration: 0.5 }}
                        style={{ width: '100%' }}
                    >
                        <Button
                            className='admin-login-button'
                            onClick={handleLogin}
                            variant='contained'
                            color='primary'
                            size='large'
                            fullWidth
                            sx={{
                                mt: 2,
                                borderRadius: '0.5rem',
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
                            Enter
                        </Button>
                    </motion.div>
                </Box>
            </Box>
        </>
    );
};

export default LoginAdmin;
