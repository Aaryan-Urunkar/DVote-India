import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import ElectionABI from "./ElectionABI.json";
import CandidateList from "./CandidateList";
import {
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Box,
  Snackbar,
  Grid
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from "react-router-dom";

const ContainerStyled = styled(Container)({
  marginTop: "16px",
  padding: "16px",
  position: "relative",
});

const PaperStyled = styled(Paper)({
  padding: "16px",
  marginBottom: "16px",
  textAlign: "center",
});

const ButtonStyled = styled(Button)({
  margin: "8px",
});

const InputStyled = styled(TextField)({
  margin: "8px",
  width: "100%",
});

const TimerStyled = styled(Box)({
  position: "absolute",
  top: "16px",
  right: "16px",
  padding: "8px",
  backgroundColor: "red",
  color: "white",
  fontWeight: "bold",
  borderRadius: "4px",
  fontSize: "16px",
});

const ProfileStyled = styled(Paper)({
  padding: "16px",
  marginRight: "16px",
});

const BlurredText = styled('span')(({ isVisible }) => ({
  filter: isVisible ? 'none' : 'blur(5px)',
  transition: 'filter 0.3s ease-in-out',
}));


const VoterDashboard = ({ electionAddress }) => {
  const [account, setAccount] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [voterName, setVoterName] = useState("");
  const [electionStatus, setElectionStatus] = useState(
    localStorage.getItem("electionStatus") || "closed"
  );
  const [acceptRules, setAcceptRules] = useState(
    JSON.parse(localStorage.getItem("acceptRules")) || false
  );
  const [timer, setTimer] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();  
  const voterDetails = location.state?.voterDetails || {};  

  const fetchCandidates = useCallback(async () => {
    if (!electionAddress) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const electionContract = new ethers.Contract(
      electionAddress,
      ElectionABI,
      provider
    );

    try {
      setLoading(true);
      const candidateList = await electionContract.getCandidates();
      const mappedCandidates = candidateList.map((candidate) => ({
        name: candidate.name,
        party: candidate.politicalParty,
      }));
      setCandidates(mappedCandidates);
    } catch (error) {
      setError("Error fetching candidates");
    } finally {
      setLoading(false);
    }
  }, [electionAddress]);

  const fetchElectionStatus = useCallback(async () => {
    if (!electionAddress) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const electionContract = new ethers.Contract(
      electionAddress,
      ElectionABI,
      provider
    );

    try {
      const status = await electionContract.getElectionStatus();
      const statusText = status === 0n ? "open" : "closed";
      setElectionStatus(statusText);
      localStorage.setItem("electionStatus", statusText);
    } catch (error) {
      setError("Error fetching election status");
    }
  }, [electionAddress]);

  useEffect(() => {
    if (acceptRules) {
      const endTime = localStorage.getItem("endTime");
      if (endTime) {
        const timeLeft = Math.max(0, endTime - Date.now());
        setRemainingTime(timeLeft);
        console.log(`Initial time left: ${timeLeft}`);
        const intervalId = setInterval(() => {
          setRemainingTime((prevTime) => {
            if (prevTime <= 0) {
              clearInterval(intervalId);
              setShowNotification(true);
              navigate("/");
              return 0;
            }
            return prevTime - 1000;
          });
        }, 1000);
        return () => clearInterval(intervalId);
      }
    }
  }, [acceptRules, navigate]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchElectionStatus();
      fetchCandidates();
    }, 10000);

    fetchElectionStatus();
    fetchCandidates();

    return () => clearInterval(intervalId);
  }, [fetchElectionStatus, fetchCandidates]);

  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        fetchCandidates();
      } catch (error) {
        setError("Failed to connect to MetaMask");
      } finally {
        setLoading(false);
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this feature.");
    }
  };

  const voteForCandidate = async (candidateParty) => {
    if (!account || !voterName || !voterDetails.id_number)
      return alert("Please fill in all details and connect to MetaMask first.");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const electionContract = new ethers.Contract(
      electionAddress,
      ElectionABI,
      signer
    );

    try {
      setLoading(true);
      const tx = await electionContract.vote(
        voterName,
        voterDetails.id_number,
        candidateParty
      );
      await tx.wait();
      setSnackbarMessage("Vote cast successfully! Logging out...");
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      setError("Error casting vote");
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    const endTime = Date.now() + 600000;
    localStorage.setItem("endTime", endTime);
    setRemainingTime(600000);
    console.log(`Timer started: ${endTime}`);
    setTimer(
      setTimeout(() => {
        setShowNotification(true);
        navigate("/");
      }, 600000)
    );
  };

  const handleAcceptRules = () => {
    setAcceptRules(true);
    localStorage.setItem("acceptRules", true);
    startTimer();
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      localStorage.removeItem("endTime");
      localStorage.removeItem("acceptRules");
      navigate("/");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [navigate]);

  const isNameCorrect = voterName.toUpperCase() === voterDetails.name_on_card?.toUpperCase();

  return (
    <ContainerStyled>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <ProfileStyled>
            <Typography variant="h6" gutterBottom>
              Profile
            </Typography>
            <Typography variant="h6"></Typography>
            <p><strong>AC No:</strong> {voterDetails.ac_no}</p>
            <p><strong>District:</strong> {voterDetails.district}</p>
            <p>
              <strong>Gender:</strong>{" "}
              {voterDetails.gender === "M"
                ? "Male"
                : voterDetails.gender === "F"
                ? "Female"
                : "Unspecified"}
            </p>
            <p><strong>ID Number:</strong> {voterDetails.id_number}</p>
            <p>
              <strong>Name on Card:</strong>{' '}
              <BlurredText isVisible={isNameCorrect}>
                {voterDetails.name_on_card ? voterDetails.name_on_card.toUpperCase() : ''}
              </BlurredText>
            </p>

            <p><strong>Part No:</strong> {voterDetails.part_no}</p>
            <p><strong>Lat Long:</strong> {voterDetails.ps_lat_long}</p>
            <p><strong>Nearest Voting Commissioner Address:</strong> {voterDetails.ps_name}</p>
            <p>
              <strong>Guardian Name:</strong>{" "}
              {voterDetails.rln_name ? voterDetails.rln_name.toUpperCase() : ""}
            </p>            
            <p><strong>Section No:</strong> {voterDetails.section_no}</p>
            <p><strong>Source:</strong> {voterDetails.source}</p>
            <p><strong>State:</strong> {voterDetails.state}</p>
          </ProfileStyled>
        </Grid>
        <Grid item xs={8}>
          {remainingTime > 0 && (
            <TimerStyled>
              {`Time Left: ${Math.floor(remainingTime / 60000)}m ${Math.floor(
                (remainingTime % 60000) / 1000
              )}s`}
            </TimerStyled>
          )}
          <Typography variant="h4" gutterBottom>
            Voter Dashboard
          </Typography>
          <PaperStyled>
            <Typography variant="h6">
              {account
                ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
                : "Connect to MetaMask"}
            </Typography>
            <ButtonStyled
              variant="contained"
              color="primary"
              onClick={connectToMetaMask}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Connect to MetaMask"}
            </ButtonStyled>
          </PaperStyled>
          {error && <Alert severity="error">{error}</Alert>}
          <PaperStyled>
            <Typography variant="h6">Vote for a Candidate</Typography>
            <InputStyled
              label="Name"
              variant="outlined"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              error={!isNameCorrect && voterName !== ""}
              helperText={!isNameCorrect && voterName !== "" ? "Name does not match Name on Card" : ""}
            />
            <InputStyled
              label="Voter ID"
              variant="outlined"
              value={voterDetails.id_number}
              //disabled (turn this on in deployment) below is for test since no voter ids except mine
              onChange={(e) => {
                const updatedDetails = { ...voterDetails, id_number: e.target.value };
                navigate(location.pathname, { state: { voterDetails: updatedDetails } });
              }}
            />

          </PaperStyled>
          <CandidateList
            candidates={candidates}
            voteForCandidate={voteForCandidate}
          />

          <Dialog open={electionStatus === "closed"}>
            <DialogTitle style={{ textAlign: "center", fontWeight: "bold" }}>
              Voting Closed
            </DialogTitle>
            <DialogContent>
              <Typography>
                Voting is currently closed. Please try again later.
              </Typography>
            </DialogContent>
            <DialogActions>
              <ButtonStyled onClick={() => navigate("/")} color="primary">
                Okay
              </ButtonStyled>
            </DialogActions>
          </Dialog>

          <Dialog open={electionStatus === "open" && !acceptRules}>
            <DialogTitle style={{ textAlign: "center", fontWeight: "bold" }}>
              Rules and Acceptance
            </DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                Please read and accept the following rules before proceeding:
              </Typography>
              <ol>
                <li>Rule 1: Voting is only allowed for registered voters.</li>
                <li>Rule 2: Each voter can vote only once.</li>
                <li>Rule 3: Voting is confidential and your choices will not be disclosed.</li>
                <li>Rule 4: Ensure all required fields are correctly filled before submitting your vote.</li>
                <li>Rule 5: MetaMask is instealled and logged in before continuing.</li>
                <li>Rule 6: You must accept the rules to proceed with voting.</li>
                <li>Rule 7: Follow the instructions provided on the voting interface.</li>
                <li>Rule 8: In case of any issues, contact support immediately.</li>
                <li>Rule 9: Only votes cast within the election period will be counted.</li>
                <li>Rule 10: Any attempt to manipulate the system is prohibited and will be reported.</li>
                <li>Rule 11: The results of the election will be announced after the voting period ends.</li>
                <li>Rule 12: The decision of the election committee is final and binding.</li>
                <li>Rule 13: By accepting these rules, you agree to abide by them and understand the consequences of violating them.</li>
              </ol>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={rulesAccepted}
                    onChange={(e) => setRulesAccepted(e.target.checked)}
                  />
                }
                label="I have read and accept the rules"
              />
            </DialogContent>
            <DialogActions>
              <ButtonStyled
                onClick={handleAcceptRules}
                color="primary"
                disabled={!rulesAccepted}
              >
                Okay
              </ButtonStyled>
            </DialogActions>
          </Dialog>

          <Dialog open={showNotification}>
            <DialogTitle style={{ textAlign: "center", fontWeight: "bold" }}>
              Time's Up
            </DialogTitle>
            <DialogContent>
              <Typography>Your time is up. You will be logged out now.</Typography>
            </DialogContent>
            <DialogActions>
              <ButtonStyled onClick={() => navigate("/")} color="primary">
                Okay
              </ButtonStyled>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            message={snackbarMessage}
          />
        </Grid>
      </Grid>
    </ContainerStyled>
  );
};

export default VoterDashboard;
