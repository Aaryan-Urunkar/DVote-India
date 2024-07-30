# <p align=center >DVote-India backend</p>
## Introduction

This is the backend or the solidity smart contracts section of the DVote-India project. Instead of hardhat, we are using Foundry which is a newer and much faster framework to test your contracts and get them production ready as soon as possible. The most important contract is `Election.sol` in the src directory. All functionality of a typical election has been implemented and further integrated with the React.js frontend in the main branch.

If you wish to run, modify or test the contract, please come over to the [Getting started](#getting-started) section for a basic understanding to launch this repo and branch on your own local machine.

If you wish to contribute, please fork this repository and create a new branch. All pull requests to the main branch will be cancelled so please create your own branch using `git branch new-feature-name` and move to it using `git checkout new-feature-name` .

<br>
<br>

## Getting started

> [!WARNING]   
>
>The `forge test` command for now will throw a lot of errors. This is normal and expected because the tests havent been modified for the newer backend. Create an issue in this repository so that it is assigned to someone or venture forth and try refactoring those tests on your own.

### Prerequisites(mandatory)

List the tools and versions required to work on the project. For example:

- [Foundry](https://getfoundry.sh/) - A blazing fast, portable, and modular toolkit for Ethereum application development written in Rust.
- [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) - A linux-like terminal in windows systems. Necessary if you want to run foundry.

### Installations

Step-by-step instructions to set up the project locally.

1. **Install Foundry:**
   ```sh
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
    ```

2. **Clone the repository**
    ```bash
    git clone https://github.com/Aaryan-Urunkar/DVote-India.git
    cd Dvote-India
    git checkout backend
    ```

<br>
<br>

3. **Install dependencies**
    ```sh
    forge install
    ```

4. **Compile all contracts**
    ```sh
    forge build
    ```


### Usage

To run the tests and deploy on a local blockchain network, follow the steps:

1. **Set up a local blockchain node**
    ```sh
      anvil
    ```
    (Equivalent to npx hardhat node)

2. **Add a new network on your wallet(metamask) using the rpc url given at the end**
    
    ```sh
    127.0.0.1:8545
    ```

3. **Open a new terminal session leaving the previous one unotuched**
<br>
<br>
<br>

4. **To run tests(which currently haven't been modified post the refactoring and hence are broken)**

    ```sh
    forge test
    ```

5. **To deploy Election.sol contract**
    ```sh
    forge create src/Election.sol:Election --private-key {ANVIL_PRIVATE_KEY} --constructor-args {ANVIL_PUBLIC_KEY}
    ```


## Features

- **Add Candidates**: Register candidates for election, ensuring no duplicate party candidates in the same region.
- **Vote**: Allow registered voters to cast their votes for candidates from their region.
- **End Election**: Mark the election as ended.
- **Declare Winner**: Calculate and declare the winner(s) based on the highest number of votes, handling ties appropriately.
- **Manage Voters**: Track voter participation to prevent double voting.

## Contract Functions

- **addCandidate**: Add a new candidate for the election.
- **vote**: Cast a vote for a candidate.
- **endElection**: End the current election.
- **declareWinner**: Declare the winner(s) of the election.
- **getCandidates**: Retrieve the list of all candidates.
- **getVoters**: Retrieve the list of all voters who have cast their votes.
- **getElectionStatus**: Get the current status of the election.
- **getVotesPerCandidate**: Get the total votes received by a specific candidate.
- **getVotesCount**: Get the list of votes for each candidate after the election ends.
- **getRegionCode**: Get the region code associated with the election.

## Errors

- `NotOwner`: Caller is not the contract owner.
- `PartyAlreadyExists`: Party already exists in the region.
- `ElectionNotEnded`: Attempted operation on an election that has not ended.
- `VoterHasAlreadyVoted`: Voter has already cast their vote.
- `ElectionNotOpen`: Operation attempted when the election is not open.
- `IllegalTransfer`: Illegal transfer of Ether to the contract.
- `CandidateDoesNotExist`: Candidate does not exist in the election.
- `VoterNotVotingFromResidentshipRegion`: Voter is not from the designated region.

## Events

- `CandidateAdded`: Emitted when a candidate is added.
- `VoterAdded`: Emitted when a voter is registered.
- `WinnerDeclared`: Emitted when the winner is declared.
- `Tie`: Emitted in case of a tie between candidates.

## How to Use

1. **Deploy the Contract**: Deploy the contract to a Solidity-compatible blockchain.
2. **Add Candidates**: Use `addCandidate` to register candidates.
3. **Register Voters**: Voters can register using `vote` function.
4. **End the Election**: Call `endElection` to close the election.
5. **Declare the Winner**: Call `declareWinner` to determine and announce the winner.


## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.
