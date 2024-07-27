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