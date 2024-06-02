import React, { useState, useEffect } from 'react';
import Hand from './components/Hand';
import PokerChip from './components/PokerChip';
import './App.css';

// TODO
// SLIDE IN/OUT START BUTTON
// DONT ALLOW HIT/STAND DURING ANIMATION
// ADD DOUBLE DOWN/SPLIT BUTTONS
// ADD BETTING

function App() {
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [deck, setDeck] = useState(createDeck());
  const [playFinished, setPlayFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (playFinished) {
      if (dealerHand[1]?.initiallyFlipped) {
        const updatedDealerHand = [...dealerHand];
        updatedDealerHand[1] = { ...updatedDealerHand[1], initiallyFlipped: false };
        setDealerHand(updatedDealerHand);
      }
      setTimeout(() => {
        let dealerValueText = document.getElementById('dealerValue');
        dealerValueText.innerText = calculateHandValue(dealerHand);
        determineWinner(playerHand, dealerHand);
      }, 1000);
    }
  }, [playFinished, dealerHand, playerHand]);

  useEffect(() => {
    initialDeal();
  }, []);

  useEffect(() => {
    if (calculateHandValue(playerHand) === 21) {
      stand();
    }
  }, [playerHand]);


  useEffect(() => {
    const buttonClick = new Audio('/sounds/click.wav');

    const handleClick = () => {
      playSound(buttonClick);
    };

    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('click', handleClick);
    });

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('click', handleClick);
      });
    };
  }, [isMuted]);



  // Create deck function
  function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = [
      { rank: '2', value: 2 },
      { rank: '3', value: 3 },
      { rank: '4', value: 4 },
      { rank: '5', value: 5 },
      { rank: '6', value: 6 },
      { rank: '7', value: 7 },
      { rank: '8', value: 8 },
      { rank: '9', value: 9 },
      { rank: '10', value: 10 },
      { rank: 'J', value: 10 },
      { rank: 'Q', value: 10 },
      { rank: 'K', value: 10 },
      { rank: 'A', value: 11 },
    ];

    let deck = [];
    suits.forEach(suit => {
      ranks.forEach(rank => {
        deck.push({ ...rank, suit });
      });
    });
    return deck;
  }

  // Function to shuffle deck
  function shuffleDeck(deck) {
    return deck.sort(() => Math.random() - 0.5);
  }

  let dealerTempValue = 0;
  let playerTempValue = 0;
  // Initial deal function
  async function initialDeal() {
    // Reset the game
    let playerValueText = document.getElementById('playerValue');
    let dealerValueText = document.getElementById('dealerValue');
    playerValueText.innerText = '0';
    dealerValueText.innerText = '0';
    setPlayFinished(false);
    setDealerHand([]);
    setPlayerHand([]);
    let startButton = document.getElementById('startButton');
    startButton.style.display = 'none';
    let resultText = document.getElementById('resultText');
    resultText.innerText = "Let's Play Blackjack!";

    // Begin new game
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);

    const firstPlayerCard = newDeck.pop();
    const secondPlayerCard = newDeck.pop();
    setPlayerHand([firstPlayerCard, secondPlayerCard]);

    const firstDealerCard = newDeck.pop();
    // const firstDealerCard = {rank: 'A', value: 11, suit: 'spades'};
    const secondDealerCard = { ...newDeck.pop(), initiallyFlipped: true };
    setDealerHand([firstDealerCard, secondDealerCard]);

    await new Promise(resolve => setTimeout(resolve, 600));
    const cards = document.getElementsByClassName('card');
    for (let i = 0; i < cards.length; i++) {
      if (i === 1) { continue; }
      cards[i].classList.remove('flipped');
    }

    playerValueText.innerText = calculateHandValue([firstPlayerCard, secondPlayerCard]);
    dealerValueText.innerText = firstDealerCard.value;

  }




  // Hit function
  async function hit() {
    if (playFinished) return;

    let newDeck = [...deck];
    let newPlayerHand = [...playerHand, newDeck.pop()];
    setPlayerHand(newPlayerHand);
    setDeck(newDeck);

    setTimeout(() => {
      playSound(new Audio('/sounds/flip.wav'));
    }, 750);
    setTimeout(() => {
      let playerValueText = document.getElementById('playerValue');
      playerValueText.innerText = calculateHandValue(newPlayerHand);
    }, 1250);

    if (calculateHandValue(newPlayerHand) > 21) {
      setTimeout(() => {
        setPlayFinished(true);
      }, 1250);
    } else if (calculateHandValue(newPlayerHand) === 21) {
      stand();
    }
  }


  async function stand() {
    if (playFinished) return;

    let newDeck = [...deck];
    let newDealerHand = [...dealerHand];
    let dealerValue = calculateHandValue(newDealerHand);

    if (newDealerHand[1].initiallyFlipped) {
      newDealerHand[1] = { ...newDealerHand[1], initiallyFlipped: false };
      await setDealerHand(newDealerHand);
      setTimeout(() => {
        playSound(new Audio('/sounds/flip.wav'));
      }, 750);
      setTimeout(() => {
        let dealerValueText = document.getElementById('dealerValue');
        dealerValueText.innerText = calculateHandValue(newDealerHand);
      }, 1250);
    }

    while ((dealerValue < 17 || (dealerValue === 17 && hasSoftAce(newDealerHand))) && newDeck.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newCard = newDeck.pop();
      newDealerHand.push(newCard);
      dealerValue = calculateHandValue(newDealerHand);
      await setDealerHand([...newDealerHand]);
      setTimeout(() => {
        playSound(new Audio('/sounds/flip.wav'));
      }, 750);
      setTimeout(() => {
        let dealerValueText = document.getElementById('dealerValue');
        dealerValueText.innerText = calculateHandValue(newDealerHand);
      }, 1250);
    }
    setPlayFinished(true);

    determineWinner(playerHand, newDealerHand);
  }

  function hasSoftAce(hand) {
    return hand.some(card => card.rank === 'A' && calculateHandValue(hand) - card.value <= 10);
  }


  // Calculate hand value function
  function calculateHandValue(hand) {
    if (!hand) { return 0; }
    let value = hand.reduce((sum, card) => sum + card.value, 0);
    let numAces = hand.filter(card => card.rank === 'A').length;
    while (value > 21 && numAces > 0) {
      value -= 10;
      numAces -= 1;
    }
    return value;
  }

  // Determine winner function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function determineWinner(playerHand, dealerHand) {
    if (!playFinished) return;

    let playerValue = calculateHandValue(playerHand);
    let dealerValue = calculateHandValue(dealerHand);

    await new Promise(resolve => setTimeout(resolve, 1500));
    let winAudio = new Audio('/sounds/win.wav');
    let loseAudio = new Audio('/sounds/lose.wav');
    let tieAudio = new Audio('/sounds/tie.wav');
    let resultText = document.getElementById('resultText');

    if (playerValue > 21) {
      resultText.innerText = "Player busts!";
      playSound(loseAudio);
    } else if (dealerValue > 21) {
      resultText.innerText = "Player wins!";
      playSound(winAudio);
    } else if (playerValue === dealerValue) {
      resultText.innerText = "It's a tie!";
      playSound(tieAudio);
    } else if (playerValue === 21 && playerHand.length === 2) {
      resultText.innerText = "Blackjack! Player wins!";
      playSound(winAudio);
    } else if (dealerValue === 21 && dealerHand.length === 2) {
      resultText.innerText = "Dealer has Blackjack! Dealer wins!";
      playSound(loseAudio);
    } else if (playerValue > dealerValue && playerValue <= 21 && dealerValue <= 21) {
      resultText.innerText = "Player wins!";
      playSound(winAudio);
    } else {
      resultText.innerText = "Dealer wins!";
      playSound(loseAudio);
    }

    let dealerValueText = document.getElementById('dealerValue');
    dealerValueText.style.display = 'block';

    await new Promise(resolve => setTimeout(resolve, 1000));
    let startButton = document.getElementById('startButton');
    startButton.style.display = 'block';

    // const dealerSecondCard = dealerHand[1];
    // dealerSecondCard.initiallyFlipped = false;
    // console.log(dealerSecondCard);
  }

  async function startNewGame() {
    shuffleAnimation();
    await new Promise(resolve => setTimeout(resolve, 1000));
    initialDeal();
  }

  async function shuffleAnimation() {
    let cards = document.getElementsByClassName('card');
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].parentElement.parentElement.parentElement.parentElement.id === 'dealer-area') {
        cards[i].style.transform = `translateY(-75vh)`;
      }
      else {
        cards[i].style.transform = `translateY(75vh)`;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
    for (let i = 0; i < cards.length; i++) {
      cards[i].style.transform = `translateY(0)`;
    }
  }

  function muteSounds() {
    setIsMuted(prevIsMuted => !prevIsMuted);
  }

  function playSound(sound) {
    if (isMuted) { return; }
    sound.play();
  }

  return (
    <div className="App">
      <button id="muteButton" onClick={muteSounds}>
        {isMuted ? <img src="/muted.png" alt="Mute Audio" /> : <img src="/unmuted.png" alt="Mute Audio" />}
      </button>
      <PokerChip id="pokerchip1" />
      <PokerChip id="pokerchip2" />
      <PokerChip id="pokerchip3" />
      <PokerChip id="pokerchip4" />
      <PokerChip id="pokerchip5" />
      <PokerChip id="pokerchip6" />
      <PokerChip id="pokerchip7" />
      <PokerChip id="pokerchip8" />
      <PokerChip id="pokerchip9" />
      <PokerChip id="pokerchip10" />
      <PokerChip id="pokerchip11" />
      <PokerChip id="pokerchip12" />
      <PokerChip id="pokerchip13" />
      <PokerChip id="pokerchip14" />
      <PokerChip id="pokerchip15" />
      <div className="result-container">
        <h2 id="resultText">Let's Play Blackjack!</h2>
      </div>
      <button id="startButton" onClick={startNewGame}>NEW<br></br>GAME</button>
      <div className="buttons">
        <button id="hitButton" onClick={hit}>HIT</button>
        <button id="standButton" onClick={stand}>STAND</button>
        {/* <button id="resetChipsButton" onClick={resetChips}>Reset Chips</button> */}
        {/* <button id="doubleButton">Double Down</button>
        <button id="splitButton">Split</button> */}
      </div>
      <div className="game-area">
        <div id="dealer-area">
          <Hand title="Dealer" hand={dealerHand} value={dealerTempValue} />
          <h3 id="dealerValue">{dealerTempValue}</h3>
        </div>
        <div id="player-area">
          <Hand title="Player" hand={playerHand} value={playerTempValue} />
          <h3 id="playerValue">{playerTempValue}</h3>
        </div>
      </div>
    </div>
  );
}

export default App;
