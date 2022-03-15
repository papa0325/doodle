import Web3 from "web3";
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Logo from "./assets/imgs/Logo.png";
import twitterPng from "./assets/imgs/twitter.png";
import discordPng from "./assets/imgs/discord.png";
import openseaPng from "./assets/imgs/opensea.png";
import mainPng from "./assets/imgs/hide.gif";
import kingpng from "./assets/imgs/King.png";
import alienpng from "./assets/imgs/Alien.png";
import bubblegumpng from "./assets/imgs/Bubble_Gum.png";
import skeletonpng from "./assets/imgs/Skeleton.png";
import spacepng from "./assets/imgs/Space.png";
import leftarrow from "./assets/imgs/left.png";
import rightarrow from "./assets/imgs/right.png";
import './App.css';
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import { useEffect, useState } from "react";
import contractAbi from "./abi/doodle.json";
import wlUserList from "./wl/user.json";
import publicProof from "./wl/public.json";

const contractAddress1 = "0x0e099d20e5f8fAD56C3BDb18Fe499Bc958248251"; // Main Net
const contratAddress2 = "0x0e099d20e5f8fAD56C3BDb18Fe499Bc958248251"; //Main Net
const contratAddress3 = "0x0e099d20e5f8fAD56C3BDb18Fe499Bc958248251"; // Main Net
const sale = true;
const publicSale = true;

function App() {
  var web3;
  var nftContract;
  var address;
  var chainId;
  const [maxQuantity] = useState(5);
  const [quantity, setQuantity] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [legendaryState, setLegendaryState] = useState(0);
  const [leftToken, setLeftToken] = useState(2500);
  if(window.ethereum != null) {
  	web3 = new Web3(window.ethereum);
  }

  const connectWallet = async () => {
    if(window.ethereum != null) {
      await window.ethereum.request({method: 'eth_requestAccounts'}).then((data) => {
        address = data[0];
        setWalletAddress(address);
      });
    } else {
      notificationfunc("error", 'Can\'t Find Metamask Wallet. Please install it and reload again to mint NFT.');
    }
  }

  const mintToken = async () => {
    if (!walletAddress){
      notificationfunc("info", 'Please connect Metamask before mint!');
    } else {
      if (quantity <= 0){
        notificationfunc("warning", "Quantity should be more than 0.");
      } else {
        if (quantity > maxQuantity) {
          notificationfunc("error", "Max quantity is " + maxQuantity);
        } else {
          nftContract = contractAbi;
          if (window.ethereum == null) {
            notificationfunc("error", 'Wallet connect error! Please confirm that connect wallet.');
          } else {
            await window.ethereum.request({method: 'eth_chainId'}).then(data => {
              chainId = data;
            });

            const { MerkleTree } = require('merkletreejs')
            const keccak256 = require('keccak256');
            const wlUsers = wlUserList;

            const leaves = wlUsers.map(x => keccak256(x));
            const tree = new MerkleTree(leaves, keccak256);
            const root = tree.getRoot().toString('hex');
            const leaf = keccak256(walletAddress);
            let userIndex = wlUsers.indexOf(walletAddress);
            let hexProof = tree.getHexProof(leaf);

            //Public Sale
            if (publicSale && !hexProof.length) {
              hexProof = publicProof;
              userIndex = 0;
            }
            if(chainId === '0x1') {
              const contract = new web3.eth.Contract(nftContract, contractAddress1);
              if (hexProof.length){
                await contract.methods.mint(walletAddress, quantity, hexProof, userIndex).send({
                  value: 50000000000000000 * quantity,
                  from: walletAddress
                })
                .then(data => {
                  notificationfunc("success", 'Successfully Minted!');
                })
                .catch(err => {
                  notificationfunc("error", err.message);
                })
              } else {
                notificationfunc("warning", "Please check your wallet.");
              }
            }else {
              notificationfunc("info", "Please change the network to Ethereum Mainnet and try again...");
            }
          }
        }
      }
    }
  }

  const nextLegendary = (nextNumber) => {
    setLegendaryState(nextNumber);
  }

  const notificationfunc = (type, message) => {
    switch (type) {
      case 'info':
        NotificationManager.info(message);
        break;
      case 'success':
        NotificationManager.success(message);
        break;
      case 'warning':
        NotificationManager.warning(message, 'Warning', 3000);
        break;
      case 'error':
        NotificationManager.error(message, 'Error', 5000);
        break;
      default:
        break;
    }
  }

  const nopresale = () => {
    notificationfunc("info", "Mint presale will be live on Jan 8th");
  }

  useEffect(() => {
    const checkConnection = async () => {
      // Check if browser is running Metamask
      let web3;
      if (window.ethereum) {
          web3 = new Web3(window.ethereum);
      } else if (window.web3) {
          web3 = new Web3(window.web3.currentProvider);
      };
      // Check if User is already connected by retrieving the accounts
      if (web3){
        web3.eth.getAccounts()
        .then(async (addr) => {
            setWalletAddress(addr[0]);
        });
      }
    };
    checkConnection();
    if (sale) {
      setInterval( async () => {
        if (web3){
          let contract = new web3.eth.Contract(contractAbi, contractAddress1);
          if (contract){
            await contract.methods.totalSupply().call((err, result) => {
              if (err){
                console.log(err);
              } else {
                let leftTokenNumber = 2500 - result;
                if (leftTokenNumber < 0) leftTokenNumber = 0;
                setLeftToken(leftTokenNumber);
              }
            })
            
          }
        }
      }, 2000);
    }
  }, []);

  return (
    <div className="App">
      <div className="container-fluid main-container">
        <div className="page-container">
          <header className="header"> 
            <img src={Logo} alt="Logo" width={420} height={140}/>
            <div className="button-wrap">
              <a className="ml-20" rel="noreferrer" href="https://twitter.com/doodleapes_nft" target="_blank">
                <img alt="Twitter" src={twitterPng} width="40" height="40"/>
              </a>
              <a className="ml-20" rel="noreferrer" href="https://discord.gg/PyFgjGNtGd" target="_blank">
                <img alt="Discord" src={discordPng} width="40" height="40"/>
              </a>
              <a className="ml-20" rel="noreferrer" href="https://opensea.io/collection/doodle-apes-society-das" target="_blank">
                <img alt="Opensea" src={openseaPng} width="40" height="40"/>
              </a>
              {walletAddress ? 
              <p className="address-text">{walletAddress.substr(0,6) + "..." + walletAddress.substr(walletAddress.length - 4)}</p> :
              <button onClick={connectWallet} className="connect-button">Connect Wallet</button>
              }
              
            </div>
          </header>

          <main>
            <div className="mintform">
              <div className="mt-2 mainPng">
                <img alt="" aria-hidden="true" src={mainPng} width="220" height="220"/>
              </div>
              <h1 className="form-title">
                <span className="cblue">M</span>
                <span className="cgreen">I</span>
                <span className="cpink">N</span>
                <span className="cpurple">T</span>
                &nbsp;
                <span className="cyellow">Y</span>
                <span className="cblue">O</span>
                <span className="cpyellow">U</span>
                <span className="cblue">R</span>
                <br/>
                <span className="cgreen">D</span>
                <span className="cpink">O</span>
                <span className="cpurple">O</span>
                <span className="cyellow">D</span>
                <span className="cblue">L</span>
                <span className="cpyellow">E</span>
                &nbsp;
                <span className="cblue">A</span>
                <span className="cgreen">P</span>
                <span className="cpink">E</span>
                <span className="cblue">S</span>
              </h1>
              {/* <h2 className="sub-title">2500 at 0.05 Max 5 per transactions</h2> */}
              {/* <h2 className="sub-title">2500 at 0.05 Max 3 per transactions</h2> */}
              <div className="max-title">Enter Quantity</div>
              <input className="quantity-input" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value < 0 ? 0  : e.target.value)} placeholder={0} min="0"/>
              <button type="button" className="mint-button" disabled="" onClick={sale ? mintToken : nopresale}>MINT</button>
              <h3 className="left-token"><span className="cgreen">{leftToken}</span>/<span className="cpink">2500</span> <span className="cblue">left</span></h3>
            </div>
          </main>
          <div className="road-map">
            <h1 className="page-block-title">
              <span className="cblue">R</span>
              <span className="cgreen">O</span>
              <span className="cpink">A</span>
              <span className="cpurple">D</span>
              <span className="cyellow">M</span>
              <span className="cpurple">A</span>
              <span className="clblue">P</span>
              &nbsp;
              <span className="cpink">1</span>
              <span className="cpurple">.</span>
              <span className="cyellow">0</span>
            </h1>
            <div className="road-map-block">
              <h2 className="block-title">CREATE A QUALITY COMMUNITY - 0%</h2>
              <p className="block-content">
                Community and mutual support are the most important things for us. This is the main reason why we started this project! We want to bring people together around the 2 best things in the world: Apes + Doodles. Only Fun and Good vibes in the Doodle Apes Society. 
              </p>
            </div>
            <div className="road-map-block">
              <h2 className="block-title">FIRST MERCH DROP - 25%</h2>
              <p className="block-content">
              The Doodle Apes society without IRL merch to flex ?? No way. We’ll create some crazy pieces for holders : Hoodies, Caps… We will share some ideas and designs on Discord and the community will make the final decisions.
              </p>
            </div>
            <div className="road-map-block">
              <h2 className="block-title">ETH AIRDROP + NFT GIVEAWAY - 50% </h2>
              <p className="block-content">
              It’s time to send some gifts straight to your wallet! we're going to host a big giveaway on Discord through mini-games that will be really fun! There will be 10 Doodle Apes to win and 10x 0.1ETH to win! 20 total winners! You just need to own 1 Doodle ape to join the Giveaway. 
              </p>
            </div>
            <div className="road-map-block">
              <h2 className="block-title">D.A.S BANK - 75%</h2>
              <p className="block-content">
              D.A.S Bank will be a community Wallet! We will send 100% of the royalties to the bank and those ETH will be airdropped between all the holders through giveaway and event. D.A.S is all about community first! 
              </p>
            </div>
            <div className="road-map-block">
              <h2 className="block-title">LEGENDARY DOODLE APES - 100%</h2>
              <p className="block-content">
              As you know the Doodle Apes society is all about dreams, hope and community! So we want to help our members to achieve their dreams that’s why we created the 5 legendary Doodle Apes!
              </p>
            </div>
          </div>

          <div className="legendary">
            <h1 className="page-block-title">
              <p>
              <span className="cblue">L</span>
              <span className="cgreen">E</span>
              <span className="cpink">G</span>
              <span className="cpurple">E</span>
              <span className="cyellow">N</span>
              <span className="clblue">D</span>
              <span className="cgreen">A</span>
              <span className="cpink">R</span>
              <span className="cpurple">Y</span>
              </p>
              &nbsp;
              <p>
              <span className="cyellow">D</span>
              <span className="clblue">O</span>
              <span className="cpyellow">O</span>
              <span className="cblue">D</span>
              <span className="cgreen">L</span>
              <span className="cpink">E</span>
              </p>
              &nbsp;
              <p>
              <span className="cblue">A</span>
              <span className="cgreen">P</span>
              <span className="cpink">E</span>
              <span className="cpurple">S</span>
              </p>
            </h1>
            { legendaryState === 0 ? <div>
              <h4 className="lendary-name">
                N.1 - The king
              </h4>
              <div className="slider">
                <img className="legendary-img" src={kingpng} width={250} height={250} alt="Legendary"/>
                <button className="right-arrow green-btn" onClick={() => nextLegendary(1)}>
                  <img src={rightarrow} width={30} alt="Right Arrow"/>
                </button>
              </div>
              <p>
                This little boy is the king of the Doodle Apes Society! If you mint it the D.A.S team will send 10k straight to your wallet! You can do whatever you want with this money.
              </p>
            </div>
            : null
            }
            { legendaryState === 1 ? <div>
              <h4 className="lendary-name">
                N.2 - Mister Bubble Gum
              </h4>
              <div className="slider">
                <button className="left-arrow yellow-btn" onClick={() => nextLegendary(0)}>
                  <img src={leftarrow} width={30} alt="Left Arrow"/>
                </button>
                <img className="legendary-img" src={bubblegumpng} width={250} height={250} alt="Legendary"/>
                <button className="right-arrow blue-btn" onClick={() => nextLegendary(2)}>
                  <img src={rightarrow} width={30} alt="Right Arrow"/>
                </button>
              </div>
              <p>
                Pack your bag, we're taking off! This Doodle Ape allows you to choose the trip of your dreams anywhere in the world. We take care of everything! Tokyo, LA, Dubai we'll organize the trip of your dream.
              </p>
            </div>
            : null
            }
            { legendaryState === 2 ? <div>
              <h4 className="lendary-name">
                N.3 - Alien Ape
              </h4>
              <div className="slider">
                <button className="left-arrow pink-btn" onClick={() => nextLegendary(1)}>
                  <img src={leftarrow} width={30} alt="Left Arrow"/>
                </button>
                <img className="legendary-img" src={alienpng} width={250} height={250} alt="Legendary"/>
                <button className="right-arrow purple-btn" onClick={() => nextLegendary(3)}>
                  <img src={rightarrow} width={30} alt="Right Arrow"/>
                </button>
              </div>
              <p>
                SHOPPING TIME! This little Alien Ape allows you to spend 5k to buy whatever you want (PS5, Iphone, Clothes..) It's time to reward yourself with some gifts.
              </p>
            </div>
            : null
            }
            { legendaryState === 3 ? <div>
              <h4 className="lendary-name">
                N.4 - Space Ape
              </h4>
              <div className="slider">
                <button className="left-arrow blue-btn" onClick={() => nextLegendary(2)}>
                  <img src={leftarrow} width={30} alt="Left Arrow"/>
                </button>
                <img className="legendary-img" src={spacepng} width={250} height={250} alt="Legendary"/>
                <button className="right-arrow green-btn" onClick={() => nextLegendary(4)}>
                  <img src={rightarrow} width={30} alt="Right Arrow"/>
                </button>
              </div>
              <p>
                We want to bring you to the event of your dream! NBA games? Concert? Champions league game? You can choose the event of your choice and the D.A.S team will organize the best moment of your life!
              </p>
            </div>
            : null
            }
            { legendaryState === 4 ? <div>
              <h4 className="lendary-name">
                N.5 - Skeleton Ape
              </h4>
              <div className="slider">
                <button className="left-arrow purple-btn" onClick={() => nextLegendary(3)}>
                  <img src={leftarrow} width={30} alt="Left Arrow"/>
                </button>
                <img className="legendary-img" src={skeletonpng} width={250} height={250} alt="Legendary"/>
                <button className="right-arrow pyellow-btn" onClick={() => nextLegendary(0)}>
                  <img src={rightarrow} width={30} alt="Right Arrow"/>
                </button>
              </div>
              <p>
                This is the Skeleton Ape if you mint this little boy he will help you to improve your NFT journey! The D.A.S teams will send you 1 ETH + 3 Free Doodle Apes straight to your wallet!
              </p>
            </div>
            : null
            }
          </div>

          <div className="faq">
            <h1 className="page-block-title">
              <span className="cblue">F</span>
              <span className="cgreen">A</span>
              <span className="cpink">Q</span>
            </h1>
            <div className="faq-wrap">
              <Accordion 
                allowMultipleExpanded={true}
                allowZeroExpanded={false}
              >
                <AccordionItem uuid={1}>
                    <AccordionItemHeading>
                        <AccordionItemButton className="f-item accordion__button">
                          What’s an NFT?
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>
                        A NFT is a ‘Non Fungible Token”. It means it’s a unique and rare digital item. You’re able to buy it, own it and trade it.
                        </p>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem  uuid={2}>
                    <AccordionItemHeading>
                        <AccordionItemButton className="se-item accordion__button">
                        How to buy a Doodle Apes?
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>
                        It’s very simple ! You need to be connected to your Metamask and have some ETH on it.
                        </p>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem  uuid={3}>
                    <AccordionItemHeading>
                        <AccordionItemButton className="th-item accordion__button">
                        How much does a Doodle Apes cost?
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>
                        We really want to keep this project affordable for everybody this is why we chose a mint price of 0.05 ETH
                        </p>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem uuid={4}>
                    <AccordionItemHeading>
                        <AccordionItemButton className="fo-item accordion__button">
                        How many Doodle Apes can I mint? 
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>
                        Presale: 3 per wallet
                        <br/>
                        Public: 5 per wallet
                        </p>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem uuid={5}>
                    <AccordionItemHeading>
                        <AccordionItemButton className="fi-item accordion__button">
                        If I buy one, where will it be?
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>
                        Your Doodle Apes will be stored in your ETH address (the one with which you logged in). You’ll be able to see him on Opensea! 
                        </p>
                    </AccordionItemPanel>
                </AccordionItem>
            </Accordion>
            </div>
          </div>

          {/* <div className="team">
            <h1 className="page-block-title">
              <span className="cblue">D</span>
              <span className="cgreen">O</span>
              <span className="cpink">O</span>
              <span className="cpurple">D</span>
              <span className="cyellow">L</span>
              <span className="clblue">E</span>
              &nbsp;
              <span className="cgreen">A</span>
              <span className="cpink">P</span>
              <span className="cpurple">E</span>
              <span className="cyellow">S</span>
              &nbsp;
              <span className="clblue">T</span>
              <span className="cpyellow">E</span>
              <span className="cblue">A</span>
              <span className="cgreen">M</span>
            </h1>

            <div className="team-content">
              <div>
                <img src={team1Png} alt="Founder/Artist" width={200} height={200}/>
                <div className="founder">
                  <h3>OBI D.A.S</h3>
                  <p>Founder/Artist</p>
                </div>
              </div>
              <div>
              <img src={team2Png} alt="Co-founder/Marketing" width={200} height={200}/>
              <div className="founder">
                  <h3>KBIRD</h3>
                  <p>Co-founder/Marketing</p>
                </div>
              </div>
              <div>
              <img src={team3Png} alt="Project Developer" width={200} height={200}/>
              <div className="founder">
                  <h3>Andreii</h3>
                  <p>Project Developer</p>
                </div>
              </div>
            </div>
          </div> */}
        </div>
        
      </div>
      <NotificationContainer/>
    </div>
  );
}

export default App;
