import React from 'react';
import { Link } from 'react-router-dom';
import "./css/Homepage.css";
import Navbar from './Navbar';
import {motion} from "framer-motion";
import Typewriter from 'typewriter-effect';
import image from "./assets/EVMImage.png";
import blockchainImage from "./assets/FuturisticElection (1).webp";
import { Point } from './helpers/HomepagePointerParagraph';

const Homepage = () => {


    return(
      <>
        <Navbar/>
        <div className='home_container'>

          <motion.h1 
          className='title'

          initial={{
            visibility:"hidden" ,
            scale:0
          }}
          animate={{
            visibility:"visible" , 
            scale:1.5
          }}
          transition={{
            duration:'2'
          }}
          >
            Welcome to Blockchain Voting
          </motion.h1>
          {/* <h1 className='title'>
            <Typewriter
              onInit={(typewriter) => {
                typewriter.typeString('Welcome to Blockchain Voting').start();
              }}
              options={{
                cursor:''
              }}
            /> 
          </h1>*/}
          {/* <p >निष्पक्ष चुनाव ही लोकतंत्र की शान है।</p> */}
          <p>
          <Typewriter
              onInit={(typewriter) => {
                typewriter.typeString('निष्पक्ष चुनाव ही लोकतंत्र की शान है।').pauseFor(3000).start();
              }}
              options={{
                cursor:''
              }}
            />
          </p>
          <div className='mid'>
              <div className='mid-left'>
                <h2 className='mid-headers'>
                  TRADITIONAL MECHANISM
                </h2>
                <motion.img 
                src={image} 
                alt="EVM-IMAGE" 
                srcset="" 
                initial={{
                  x:-500
                }}
                animate={{
                  x:0
                }}
                transition={{
                  duration:"1"
                }}
                whileHover={{
                  scale:1.1
                }}
                />
                <span 
                className='info'
                >
                  <Point point={"EVMs used in Indian elections are centrally manufactured and distributed by a designated authority, typically the Election Commission of India. This centralized control ensures standardization but also raises concerns about the possibility of vulnerabilities being exploited at the manufacturing or distribution stages."}/>
                  <Point point={"Critics of EVMs point out that their centralized design could potentially lead to tampering or manipulation, especially if there are lapses in the oversight or security protocols during transportation, storage, or deployment at polling stations."}></Point>
                  <Point point={"Despite stringent security measures, there have been occasional concerns and allegations regarding the integrity of EVMs, with calls for enhanced transparency and independent verification to address doubts about their susceptibility to tampering or manipulation."}></Point>
                </span>
              </div>
              <div className='mid-right'>
                <h2 className='mid-headers'>
                  DECENTRALIZED MECHANISM
                </h2>
                <motion.img 
                src={blockchainImage} 
                alt="BLOCKCHAIN-ELECTION-IMAGE" 
                srcset="" 
                initial={{
                  x:500
                }}
                animate={{
                  x:0
                }}
                transition={{
                  duration:"1"
                }}
                whileHover={{
                  scale:1.1
                }}
                />
                <span className='info'>
                  <Point point={"Blockchain voting is a voting system that uses blockchain technology to ensure transparency, security, and immutability of the voting process. It allows for tamper-proof and verifiable voting records."}></Point>
                  <Point point={"Each vote is recorded as a transaction on a blockchain network. The votes are encrypted and stored in a decentralized manner, making it difficult for anyone to manipulate the results. The transparency of the blockchain allows for auditing and verification of the voting process."}></Point>
                  <Point point={"Blockchain voting is considered to be secure due to the cryptographic algorithms used to encrypt the votes and the decentralized nature of the blockchain network. The transparency and immutability of the blockchain make it difficult for hackers to tamper with the voting records."}></Point>
                </span>
              </div>
          </div>
          <footer className='footer'>
            <div className='Your-voice-matters'>
              <motion.h1
               whileHover={{
                color:"red"
               }}
               transition={{
                duration:"1",
                ease:"easeInOut"
              }}
              >
                YOUR VOICE COUNTS. THIS ELECTION, PLEASE VOTE WITHOUT HESITATION OR FEAR.
              </motion.h1>
              <Link to="/loginuser" >
                <motion.button 
                  className='btn'
                  initial={{}}
                  whileTap={{
                    scale:"0.7"
                  }}
                >
                  Vote Now! 
                </motion.button>
              </Link>
            </div>
            
          </footer>
          {/* <Link to="/loginadmin" >
            <button> Login Admin</button>
          </Link>
          <Link to="/loginuser" >
            <button>Vote Now! </button>
          </Link>
          <div >
            <h2 >Frequently Asked Questions</h2>
            <div >
                <h3 >What is blockchain voting?</h3>
                <p >
                  Blockchain voting is a voting system that uses blockchain technology to ensure transparency, security, and immutability of the voting process. It allows for tamper-proof and verifiable voting records.
                  </p>
            </div>
            <div >
                <h3 >How does blockchain voting work?</h3>
                <p >
                In blockchain voting, each vote is recorded as a transaction on a blockchain network. The votes are encrypted and stored in a decentralized manner, making it difficult for anyone to manipulate the results. The transparency of the blockchain allows for auditing and verification of the voting process.
                </p>
            </div>
            <div >
                  <h3 >Is blockchain voting secure?</h3>
                  <p >
                    Yes, blockchain voting is considered to be secure due to the cryptographic algorithms used to encrypt the votes and the decentralized nature of the blockchain network. The transparency and immutability of the blockchain make it difficult for hackers to tamper with the voting records.
                  </p>
            </div>
          </div> */}
        </div>
          </>
        );
};

export default Homepage;
