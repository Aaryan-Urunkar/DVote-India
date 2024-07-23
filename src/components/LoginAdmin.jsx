import React, { useState , useRef } from 'react';
import { useNavigate } from "react-router-dom";
import "./css/LoginAdmin.css";
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const LoginAdmin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [incorrectDetails , setIncorrectDetails] = useState(false);

    const usernameRef = useRef('');
    const passwordRef = useRef('');

    const navigate = useNavigate();    

    const handleLogin = () => {
        if (username === 'admin' && password === 'tester') {
            usernameRef.current.classList.remove("wrong");
            passwordRef.current.classList.remove("wrong");
            setIncorrectDetails(false);
            console.log('Login successful');
            navigate("/Admin-Dashboard");
        } else {
            console.log(usernameRef);
            usernameRef.current.classList.add("wrong");
            passwordRef.current.classList.add("wrong");
            setIncorrectDetails(true);
        }
    };

    return (
        <>
            <Navbar></Navbar>
            <div className='admin-login-container'>
                <div className='login-box'>
                    <h2 >Login</h2>
                    <input
                        ref={usernameRef}
                        name='username'
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className='admin-login-input'
                    />
                    <input
                        ref={passwordRef}
                        name='password'
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='admin-login-input'
                    />
                    {incorrectDetails && 
                        <>
                            <span className='wrong'>
                                Incorrect details entered. Please try again.
                            </span>
                        </>
                    }
                    <motion.button 
                    className="admin-login-button" 
                    onClick={handleLogin} 
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
                    Enter
                    </motion.button>
                </div>
            </div>
        </>
    );
};

export default LoginAdmin;
