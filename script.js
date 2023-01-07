"use strict";

const computerEl = document.querySelector(".computer_hand");
const playerEl = document.querySelector(".player_hand");
const boardEl = document.querySelector(".board");

const deck = [
  "1d",
  "1b",
  "1c",
  "1s",
  "2d",
  "2b",
  "2c",
  "2s",
  "3d",
  "3b",
  "3c",
  "3s",
  "4d",
  "4b",
  "4c",
  "4s",
  "5d",
  "5b",
  "5c",
  "5s",
  "6d",
  "6b",
  "6c",
  "6s",
  "7d",
  "7b",
  "7c",
  "7s",
  "8d",
  "8b",
  "8c",
  "8s",
  "9d",
  "9b",
  "9c",
  "9s",
  "10d",
  "10b",
  "10c",
  "10s",
];

let playerHand = [];
let computerHand = [];
let board = [];
const playerPile = [];
const computerPile = [];
let boardCombinations = new Set();
let boardNum = [];
let chooseCard = false;
let cardsSum = 0;
let clickHandNum;
let clickHandFull;
let chosenCards = [];
let playerTurn = true;
let turnCount = 0;

/////////////////////////////////////////////////////////

function drawCard(player) {
  const random = Math.trunc(Math.random() * deck.length);

  player.push(deck[random]);
  player === playerHand && showCard(deck[random], playerEl);
  player === computerHand && showCard(deck[random], computerEl);
  // player === computerHand && showCard("back", computerEl);
  deck.splice([random], 1);
}

function drawThreeCards() {
  turnCount = 0;
  for (let i = 0; i < 3; i++) {
    drawCard(playerHand);
    drawCard(computerHand);
  }
}

function fillBoard() {
  for (let i = 0; i < 4; i++) {
    drawCard(board);
    showCard(board[i], boardEl);
  }
}

function startGame() {
  drawThreeCards();
  fillBoard();
  calculateCombinations();
}

function refresh() {
  playerHand = [];
  computerHand = [];
  board = [];
  for (let i = 0; i < playerEl.childElementCount; i++) {
    playerHand.push(playerEl.childNodes[i].id);
  }
  for (let i = 0; i < computerEl.childElementCount; i++) {
    computerHand.push(computerEl.childNodes[i].id);
  }
  for (let i = 0; i < boardEl.childElementCount; i++) {
    board.push(boardEl.childNodes[i].id);
  }
}

function showCard(card, place) {
  const string = `<img ${
    place === computerEl ? `class="card_back" id="${card}"` : `id="${card}"`
  } src="Cards/${card}.png" />`;
  place.insertAdjacentHTML("beforeend", string);
}

function calculateCombinations() {
  boardCombinations.clear();
  boardToNums();
  const map = new Map();
  for (let i = 0; i < boardNum.length; i++) {
    boardCombinations.add(boardNum[i]);
    for (let n = 0; n < boardNum.length; n++) {
      const sum = boardNum[i] + boardNum[n];
      if (sum <= 10 && i !== n) {
        map.set([i, n], sum);
        boardCombinations.add(sum);
      }
    }
  }
  map.forEach(function (value, key) {
    boardNum.forEach(function (val, index) {
      if (key[0] !== index && key[1] !== index && value + val <= 10) {
        boardCombinations.add(value + val);
      }
    });
  });
}

function boardToNums() {
  boardNum = [];
  board.forEach(function (num) {
    boardNum.push(Number(num.slice(0, -1)));
  });
}

function putCard(card) {
  removeCards([card]);
  board.push(card);
  showCard(card, boardEl);
}

function removeCards(cards) {
  cards.forEach(function (card) {
    document.getElementById(card).remove();
  });
}

function pileCards(cards, player, place) {
  cards.forEach(function (card) {
    place.push(card);
  });
}

function computerPlay() {
  if (turnCount === 6) drawThreeCards();
  refresh();
  calculateCombinations();
  const playableCards = computerHand.filter(function (card) {
    if (boardCombinations.has(Number(card.slice(0, -1)))) return card;
  });
  if (playableCards.length === 0) {
    const playCard = computerHand.reduce(function (acc, card) {
      const cardNum = Number(card.slice(0, -1));
      const accNum = Number(acc.slice(0, -1));
      if (cardNum > accNum && cardNum !== 7) return card;
      else return acc;
    }, computerHand[0]);
    putCard(playCard, computerHand);
  } else if (playableCards.some((card) => Number(card.slice(0, -1)) === 7)) {
    const cardHand = playableCards.find(
      (card) => Number(card.slice(0, -1)) === 7
    );
    const boardCards = computerFindCards(cardHand);
    if (boardCards.length > 1 && typeof boardCards !== "string") {
      pileCards([cardHand, ...boardCards], computerHand, computerPile);
      removeCards([cardHand, ...boardCards]);
    } else {
      pileCards([cardHand, boardCards], computerHand, computerPile);
      removeCards([cardHand, boardCards]);
    }
  } else {
    const randomComputerCard = playableCards[randomNum(playableCards)];
    const randomBoardCards = computerFindCards(randomComputerCard);
    if (randomBoardCards.length > 1 && typeof randomBoardCards !== "string") {
      pileCards(
        [randomComputerCard, ...randomBoardCards],
        computerHand,
        computerPile
      );
      removeCards([randomComputerCard, ...randomBoardCards]);
    } else {
      pileCards(
        [randomComputerCard, randomBoardCards],
        computerHand,
        computerPile
      );
      removeCards([randomComputerCard, randomBoardCards]);
    }
  }
  playerTurn = true;
  turnCount++;
  refresh();
  calculateCombinations();
  if (turnCount === 6) drawThreeCards();
}

function computerFindCards(computerHand) {
  const minus = new Map();
  const comb = new Map();
  let playCards = [];
  board.forEach(function (num) {
    const sub = Number(computerHand.slice(0, -1)) - Number(num.slice(0, -1));
    if (sub > 0) minus.set(num, sub);
    else if (sub === 0) comb.set(num, 0);
  });
  minus.forEach(function (sub, val) {
    board.forEach(function (num) {
      const subs = sub - Number(num.slice(0, -1));
      if ((boardNum.includes(subs) || subs === 0) && val !== num)
        comb.set([val, num], subs);
    });
  });
  comb.forEach(function (val, key) {
    if (val === 0) playCards.push(key);
  });
  if (playCards.length > 1)
    playCards = playCards = playCards[randomNum(playCards)];
  if (playCards.length === 0) {
    comb.forEach(function (val, key) {
      if (val !== 0) playCards.push([...key, val]);
    });

    playCards = playCards[randomNum(playCards)];
    board.forEach(function (card) {
      if (
        card.includes(playCards[playCards.length - 1]) &&
        !playCards.includes(card)
      )
        playCards[playCards.length - 1] = card;
    });
  }
  return playCards;
}

function randomNum(arr) {
  return Math.trunc(Math.random() * arr.length);
}

///////////////////////////////////////////////////////

playerEl.addEventListener("click", function (e) {
  calculateCombinations();
  if (!e.target.id || !playerTurn) return;
  clickHandNum = Number(e.target.id.slice(0, -1));
  clickHandFull = e.target.id;
  if (!boardCombinations.has(clickHandNum)) {
    turnCount++;
    putCard(clickHandFull);
    refresh();
    computerPlay();
    return;
  }
  chooseCard = true;
  cardsSum = 0;
  chosenCards = [];
  chosenCards.push(clickHandFull);
});

boardEl.addEventListener("click", function (e) {
  calculateCombinations();
  if (!e.target.id || !chooseCard || !playerTurn) return;
  const clickBoardNum = Number(e.target.id.slice(0, -1));
  const clickBoardFull = e.target.id;
  cardsSum += clickBoardNum;
  !chosenCards.includes(clickBoardFull) && chosenCards.push(clickBoardFull);
  if (cardsSum === clickHandNum) {
    pileCards(chosenCards, playerHand, playerPile);
    removeCards(chosenCards);
    playerTurn = false;
    chooseCard = false;
    turnCount++;
    computerPlay();
    refresh();
  }
});

//////////////////////////////////////////////////////////////

startGame();
