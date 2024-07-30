import React from 'react';
import { Container, Typography, Grid, Box, Paper, IconButton } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import { styled } from '@mui/material/styles';
import Navbar from './Navbar';
import CanvaImage from '../components/assets/CanvaIcon.png';
const teamMembers = [
    { name: 'Aaryan Urunkar', linkedin: '#', github: 'https://github.com/Aaryan-Urunkar' },
    { name: 'Nitya Shetty', linkedin: '#', github: '#' },
    { name: 'Varun Jhaveri', linkedin: 'https://www.linkedin.com/in/vnjhaveri/', github: 'https://github.com/CYCLOP5' },
    { name: 'Devesh Acharya', linkedin: 'https://linktr.ee/deveshacharya', github: 'https://linktr.ee/deveshacharya' },
    { name: 'Swayam Kelkar', linkedin: '#', github: '#' },
    { name: 'Sarthi Kanade', linkedin: '#', github: '#' },
    { name: 'Floyd Pinto', linkedin: '#', github: '#' },
    { name: 'Dhruv Shetty', linkedin: '#', github: '#' },
    { name: 'Saayna Narvekar', linkedin: '#', github: '#' },
    { name: 'Aadhira Nair', linkedin: '#', github: '#' },
];

const HoverContainer = styled(Paper)(({ theme }) => ({
    padding: '10px',
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    textAlign: 'center',
    '&:hover .name': {
        opacity: 0,
    },
    '&:hover .icons': {
        opacity: 1,
    },
}));

const IconContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '10px',
    opacity: 0,
    transition: 'opacity 0.3s',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '10px',
}));

const AboutUs = () => {
    return (
        <>
            <Navbar />

            <Container maxWidth="md">
                <Box mt={5} mb={5}>
                    <Paper
                        elevation={3}
                        style={{
                            padding: '20px',
                            marginBottom: '50px',
                            marginTop: '100px',
                            borderRadius: '16px',
                        }}
                    >
                        <Typography variant="h6" align="center" color="textSecondary" paragraph>
                            DVote/EVM (Ethereum Voting Machine) is dedicated to revolutionizing voting in India by allowing users to vote via applications in place of the present existing EVM(Electronic Voting Machines).
                        </Typography>
                        <Typography variant="body1" align="center" paragraph>
                            When we began our project, our team of engineering students set out to find issues prevailing presently in our community. With the 2024 Indian elections (the biggest in the world with about a billion eligible voters) just having taken place, our team found disputes and fears regarding voter fraud, vote counting, tampering, and accessibility issues.
                        </Typography>
                        <Typography variant="body1" align="center" paragraph>
                            Our team sought to tackle all these problems by removing the problem at the root. A change is required, and we believe it can come in the form of a Blockchain-based, decentralized system of voting. This is exactly what DVote/EVM (Ethereum Voting Machine) can do.
                        </Typography>
                        <Typography variant="body1" align="center" paragraph>
                            Our app is able to tackle security issues through cryptographically proven mechanisms, upholds privacy of each voter and most importantly, no single government or entity owns an entire blockchain thus maintaining the integrity of its decentralized nature.
                        </Typography>
                        <Typography variant="body1" align="center" paragraph>
                            We aim to provide better accessibility to the near billion eligible voters of India, to reach the highest of peaks and the most deserted deserts ridding the elections, once and for all, of all the technical challenges the Electronic Voting Machines have brought with them.
                        </Typography>
                        <Typography variant="body1" align="center" paragraph>
                            Conception, ideation and innovation of this app comes from the students of the Sardar Patel Institute of Technology whilst working on our community project.
                        </Typography>
                    </Paper>

                    <Paper elevation={3} style={{ padding: '20px', borderRadius: '16px' }}>
                        <Typography variant="h5" align="center" gutterBottom>
                            Meet our members:
                        </Typography>
                        <Grid container spacing={2} justifyContent="center">
                            {teamMembers.map((member, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <HoverContainer elevation={1}>
                                        <Typography variant="body1" align="center" className="name">
                                            {member.name}
                                        </Typography>
                                        <IconContainer className="icons">
                                            <IconButton href={member.linkedin} target="_blank" aria-label="LinkedIn">
                                                <LinkedInIcon />
                                            </IconButton>
                                            <IconButton href={member.github} target="_blank" aria-label="GitHub">
                                                <GitHubIcon />
                                            </IconButton>
                                        </IconContainer>
                                    </HoverContainer>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>

                    <Paper elevation={3} style={{ padding: '20px', borderRadius: '16px', marginTop: '30px' }}>
                        <Typography variant="h5" align="center" gutterBottom>
                            Resources
                        </Typography>
                        <Box display="flex" justifyContent="center" alignItems="center" gap="20px">
                            <IconButton href="https://www.canva.com/design/DAGMWyRDln0/EiAN7IyyHCqyEP1UXE17tw/edit" target="_blank" aria-label="Canva">
                                <img src={CanvaImage} alt="Canva" style={{ width: 40, height: 40 }} />
                            </IconButton>
                            <IconButton href="https://github.com/Aaryan-Urunkar/DVote-India" target="_blank" aria-label="GitHub">
                                <GitHubIcon style={{ fontSize: 40 }} />
                            </IconButton>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </>
    );
};

export default AboutUs;
