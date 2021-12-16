import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from 'ethers';
import mintNFT from './utils/mintNFT.json';

const TWITTER_HANDLE = '_eggr_';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://rinkeby.rarible.com/token/INSERT_CONTRACT_ADDRESS_HERE:INSERT_TOKEN_ID_HERE';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x26C58614683F010Ca9383fB38a30d9AaF49FC105";
const { NFT_STORAGE_KEY } = "./consts";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window;

        if (!ethereum) {
            console.log('Make sure you have MetaMask!');
            return;
        }

        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Connected to chain " + chainId);
        const rinkebyChainId = "0x4";

        if (chainId !== rinkebyChainId) {
            console.log("You are not connected to the Rinkeby Test Network!");
            return;
        }

        console.log("We have the ethereum object", ethereum);
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log('found authorized account:', account);
            setCurrentAccount(account);

            setupEventListener();
        } else {
            console.log("No authorized account found")
        }
    };

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert('Get MetaMask!');
                return;
            }
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            console.log('Connected:', accounts[0]);
            setCurrentAccount(accounts[0]);
            
            setupEventListener();
            return alert('Account connected!');
        } catch(err) {
            console.log(err);

        }
    };

    const askContractToMintNft = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedSmartContract = new ethers.Contract(CONTRACT_ADDRESS, mintNFT.abi, signer);


                `===========`
                const name = 'Saint Benedict';
                const description = 'ora et labora'
                // First we use the nft.storage client library to add the image and metadata to IPFS / Filecoin
                const client = new NFTStorage({ token: NFT_STORAGE_KEY });
                setStatus("Uploading to nft.storage...")
                const metadata = await client.store({
                    name,
                    description,
                    image,
                });
                setStatus(`Upload complete! Minting token with metadata URI: ${metadata.url}`);
                
                `===========`

                console.log("Going to pop wallet now to pay gas...");
                let nftTxn = await connectedSmartContract.mintNFT();

                console.log("Mining...please wait.")
                await nftTxn.wait();
                
                console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (err) {
            console.log(err)
        }
    };

    const setupEventListener = () => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, mintNFT.abi, signer);
    
                connectedContract.on("NewMint", (from, tokenId) => {
                    console.log('divine calling:', from, tokenId.toNumber());
                    alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
                });
        
                console.log("Setup event listener!")
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (err) {
            console.log(err);
        }
    };

    const renderNotConnectedContainer = () => (
        <button onClick={connectWallet} className="cta-button connect-wallet-button">
            Connect to Wallet
        </button>
    );

    const renderMintContainer = () => (
        <div>
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                mint non-fungible token
            </button>
            <div>
                Drop an image file or click below to select.
                {/* import Upload component from ant or find blueprint one */}
                <Upload
                    name="avatar"
                    accept=".jpeg,.jpg,.png,.gif"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                    beforeUpload={beforeUpload}
                >
                {uploadButton}
                </Upload>
            </div>
        </div>
    );

    const beforeUpload = (file, fileList) => {
        console.log(file, fileList);
        setFile(file);
        setPreviewURL(URL.createObjectURL(file));
        return false;
    }

    const uploadButton = () => (
        <div>
            <div style={{ marginTop: 8 }}>
                Choose image
            </div>
        </div>
    );

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <div className="App">
            <div className="container">
                <div className="header-container">
                    {currentAccount === "" ? (
                        renderNotConnectedContainer()
                    ) : (
                        renderMintContainer()
                    )}
                </div>
                <div className="footer-container">
                    <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
                    <a
                        className="footer-text"
                        href={TWITTER_LINK}
                        target="_blank"
                        rel="noreferrer"
                    >{`built by @${TWITTER_HANDLE}`}</a>
                </div>
            </div>
        </div>
    );
};

export default App;