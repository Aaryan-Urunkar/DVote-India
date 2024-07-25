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
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";

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

const VoterDashboard = ({ electionAddress }) => {
  const [account, setAccount] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [voterName, setVoterName] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
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
    if (!account || !voterName || !aadharNumber)
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
        aadharNumber,
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

  const verificationResult = {
    ac_no: "123456",
    date_of_birth: "01/01/1980",
    district: "Dummy District",
    gender: "Male",
    house_no: "123",
    id_number: "ID123456",
    last_update: "01/01/2024",
    name_on_card: "John Doe",
    part_no: "Part1",
    ps_lat_long: "12.3456, 78.9012",
    ps_name: "Polling Station 1",
    rln_name: "John Doe",
    section_no: "Section A",
    source: "Source",
    st_code: "ST123",
    state: "Dummy State",
    status: "Active",
  };

  return (
    <ContainerStyled>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <ProfileStyled>
            <Typography variant="h6" gutterBottom>
              Profile
            </Typography>
            <Typography variant="h6"></Typography>
            <p><strong>AC No:</strong> {verificationResult.ac_no}</p>
            <p><strong>Date of Birth:</strong> {verificationResult.date_of_birth}</p>
            <p><strong>District:</strong> {verificationResult.district}</p>
            <p><strong>Gender:</strong> {verificationResult.gender}</p>
            <p><strong>House No:</strong> {verificationResult.house_no}</p>
            <p><strong>ID Number:</strong> {verificationResult.id_number}</p>
            <p><strong>Last Update:</strong> {verificationResult.last_update}</p>
            <p><strong>Name on Card:</strong> {verificationResult.name_on_card}</p>
            <p><strong>Part No:</strong> {verificationResult.part_no}</p>
            <p><strong>PS Lat Long:</strong> {verificationResult.ps_lat_long}</p>
            <p><strong>PS Name:</strong> {verificationResult.ps_name}</p>
            <p><strong>Rln Name:</strong> {verificationResult.rln_name}</p>
            <p><strong>Section No:</strong> {verificationResult.section_no}</p>
            <p><strong>Source:</strong> {verificationResult.source}</p>
            <p><strong>ST Code:</strong> {verificationResult.st_code}</p>
            <p><strong>State:</strong> {verificationResult.state}</p>
            <p><strong>Status:</strong> {verificationResult.status}</p>
          </ProfileStyled>
        </Grid>
        <Grid item xs={9}>
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
            />
            <InputStyled
              label="Aadhar Number"
              variant="outlined"
              value={aadharNumber}
              onChange={(e) => setAadharNumber(e.target.value)}
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
                {Array.from({ length: 15 }, (_, i) => (
                  <li key={i}>Rule {i + 1}: [Dummy rule description]</li>
                ))}
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