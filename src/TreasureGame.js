// Treasure Remake with Full Narrative and Sea Creature Logic + Message History

import { useState } from "react";
const STRINGS = {
  intro: "You are stranded on a desert island. Please indicate what you would like to do next...",
  debugOn: "Debug mode ON",
  debugOff: "Debug mode OFF",
  fireDeath: "You set the island on fire and burn to death. You died.",
  invalidCommand: "I am sorry. I do not understand that command",
  edgeTouch: "Your feet touch water...",
  digPrompt: "You feel something beneath your feet...",
  treasureWin: "You have won and You Did NOT Die<<br>>Press any key to play again...",
  meaningOfLifeSuccess: "Great - hold on tight and stick out your thumb. <<br>> We are out of here losers.<<br>>You have won. <<br>> You Did NOT Die.<<br>><<br>>Yet.<<br>>Press any key to play again...",
  meaningOfLifeFail: "Sorry mate. See you in a different dimension. <<br>>The planet has been destroyed with you on it.<<br>>You Died.<<br>>",
  hogwartsIntro: "You are transported to Hogwarts!!! <<br>>You are met by a magical witch. <<br>>She offers a rock, a stick, or a poncho.",
  towelPrompt: "An alien appears from outerspace. <<br>>Oh great, you have your towel. <<br>>The planet is set to be destroyed... <<br>> But, wait, do you know what is the meaning of life?",
  blackHolePrompt: "You found a black hole... <<br>>Do you want to enter it? (yes/no)",
  stumblePrompt: "You feel something beneath your feet...",
  distractionItems: ["a boot", "a magnifying glass", "a towel", "a spear", "a black hole"],
  validMoveCommands: ["move", "go", "walk", "step"],
  validDirections: ["up", "down", "left", "right"],
  deathMessages: [
    "You have been devoured by a shark. <<br>>You Died.",
    "You have been stung and killed by a box jellyfish. <<br>>You Died.",
    "A crocodile has appeared and pulled you under – you will not survive. <<br>>You Died. "
  ]
};

const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;
const DEATH_MESSAGES = STRINGS.deathMessages;

const getRandomPosition = () => ({
  x: Math.floor(Math.random() * GRID_WIDTH),
  y: Math.floor(Math.random() * GRID_HEIGHT),
});

let TREASURE_POS = getRandomPosition();

const DISTRACTION_ITEMS = STRINGS.distractionItems;

const getRandomDistractions = () => {
  const positions = new Set();
  const distractions = [];
  while (distractions.length < DISTRACTION_ITEMS.length) {
    const pos = getRandomPosition();
    const key = `${pos.x},${pos.y}`;
    if (!positions.has(key) && (pos.x !== TREASURE_POS.x || pos.y !== TREASURE_POS.y)) {
      positions.add(key);
      distractions.push({ ...pos, item: DISTRACTION_ITEMS[distractions.length] });
    }
  }
  return distractions;
};

const validMoveCommands = STRINGS.validMoveCommands;
const validDirections = STRINGS.validDirections;

import { useRef, useEffect } from "react";

const TreasureGame = () => {
  const bottomRef = useRef(null);
  const [debugStatus, setDebugStatus] = useState("");
  const [debug, setDebug] = useState(false);
  const [player, setPlayer] = useState(getRandomEdgePosition());
  const [messages, setMessages] = useState(["You are stranded on a desert island. Please indicate what you would like to do next..."]);
  const [found, setFound] = useState(false);
  const [digPrompt, setDigPrompt] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [distractions, setDistractions] = useState(getRandomDistractions());
  const [reverseControls, setReverseControls] = useState(false);
  const [stumbledItem, setStumbledItem] = useState(null);
  const [pickupPrompt, setPickupPrompt] = useState(false);
  const [expectingAnswer, setExpectingAnswer] = useState(null);
  const [edgeTouched, setEdgeTouched] = useState(null);
  const [dead, setDead] = useState(false);
  const [won, setWon] = useState(false);

  function getRandomEdgePosition() {
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0: return { x: 0, y: Math.floor(Math.random() * GRID_HEIGHT) };
      case 1: return { x: GRID_WIDTH - 1, y: Math.floor(Math.random() * GRID_HEIGHT) };
      case 2: return { x: Math.floor(Math.random() * GRID_WIDTH), y: 0 };
      case 3: return { x: Math.floor(Math.random() * GRID_WIDTH), y: GRID_HEIGHT - 1 };
      default: return { x: 0, y: 0 };
    }
  }

  const addMessage = (msg) => {
    if (msg.includes("<<br>>")) {
      const lines = msg.split("<<br>>").filter(Boolean);
      lines.forEach((line, i) => {
        setTimeout(() => {
          setMessages((prev) => [...prev, line]);
        }, i * 1500);
      });
    } else {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const resetGame = () => {
    TREASURE_POS = getRandomPosition();
    setPlayer(getRandomEdgePosition());
    setMessages([STRINGS.intro]);
    setDebugStatus("");
    setFound(false);
    setDigPrompt(false);
    setInventory([]);
    setDistractions(getRandomDistractions());
    setReverseControls(false);
    setStumbledItem(null);
    setPickupPrompt(false);
    setExpectingAnswer(null);
    setEdgeTouched(null);
    setDead(false);
    setWon(false);
  };

  const renderGrid = () => {
    let output = "";
    for (let y = 0; y < GRID_HEIGHT; y++) {
      let row = "";
      for (let x = 0; x < GRID_WIDTH; x++) {
        const isPlayer = player.x === x && player.y === y;
        const isTreasure = TREASURE_POS.x === x && TREASURE_POS.y === y;
        const isDistraction = distractions.some((d) => d.x === x && d.y === y);
        if (isPlayer) {
          row += "U";
        } else if (isTreasure && (found || debug)) {
          row += "*";
        } else if (isDistraction) {
          const distraction = distractions.find(d => d.x === x && d.y === y);
          const codeMap = {
            "a boot": "B",
            "a magnifying glass": "M",
            "a towel": "W",
            "a spear": "S",
            "a black hole": "O"
          };
          row += codeMap[distraction.item] || "*";
        } else {
          row += ".";
        }
      }
      output += row + "\n";
    }
    return output;
  };

  const handleCommand = (event) => {
    if (debug && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      const keyMap = {
        ArrowUp: "move up",
        ArrowDown: "move down",
        ArrowLeft: "move left",
        ArrowRight: "move right"
      };
      event.target.value = keyMap[event.key];
      event.key = "Enter";
    }
    if (event.key !== "Enter") return;
    if (dead) return resetGame();
    const userInput = event.target.value.trim().toLowerCase();
    event.target.value = "";

    if (userInput === "debugon") {
      if (!debug) {
        setDebug(true);
        setDebugStatus("Debug mode ON");
      }
      return;
    } else if (userInput === "debugoff") {
      setDebug(false);
      setDebugStatus("");
      return;
    }

        if (expectingAnswer === "meaning_of_life") {
      if (userInput === "42") {
        addMessage(STRINGS.meaningOfLifeSuccess);
        setWon(true);
        setDebug(false);
        setDead(true);
        setTimeout(resetGame, 4000);
      } else {
        addMessage(STRINGS.meaningOfLifeFail);
        setDead(true);
        setTimeout(resetGame, 4000);
      }
      setExpectingAnswer(null);
      return;
    }

    if (expectingAnswer === "hogwarts_choice") {
      if (userInput === "rock") {
        addMessage("You have been given the power to bring back the dead...<<br>> and now zombies overrun the earth. <<br>> You Are Dead.");
        setDead(true);
        setTimeout(resetGame, 4000);
      } else if (userInput === "stick") {
        addMessage("You become power-mad and destroy everything.<<br>> You Are Dead.");
        setDead(true);
        setTimeout(resetGame, 4000);
      } else if (userInput === "poncho") {
        addMessage("You hide when needed and live happily.<<br>> Love finds you. <<br>> Then you die.<<br>> You Are Dead.");
        setTimeout(resetGame, 4000);
      } else {
        addMessage("The witch doesn't understand your choice.");
      }
      return;
    }

    if (pickupPrompt) {
      if (userInput === "yes") {
        if (stumbledItem.item === "a black hole") {
          addMessage(STRINGS.blackHolePrompt);
          setExpectingAnswer("enter_black_hole");
          return;
        }
        if (stumbledItem.item === "a towel") {
          addMessage(STRINGS.towelPrompt);
          setExpectingAnswer("meaning_of_life");
          return;
        }
        if (stumbledItem.item === "a boot") {
          addMessage(STRINGS.hogwartsIntro);
          setExpectingAnswer("hogwarts_choice");
          return;
        }
        setInventory((prev) => [...prev, stumbledItem.item]);
        setDistractions(distractions.filter(d => d !== stumbledItem));
        addMessage(`You picked up ${stumbledItem.item}.`);
        setStumbledItem(null);
        setPickupPrompt(false);
        return;
      } else if (userInput === "no") {
        addMessage("You leave it where it is.");
        setStumbledItem(null);
        setPickupPrompt(false);
        return;
      }
    }

    if (digPrompt && userInput === "dig" || userInput === "use spear") {
      if (inventory.includes("a spear")) {
        addMessage("A sacred protector arrives and attacks you. <<br>> You Are Dead.");
        setDead(true);
        setTimeout(resetGame, 4000);
      } else {
        addMessage("A sacred protector arrives and grants you access to the treasure.<<br>>");
        setFound(true);
        addMessage("You have WON and You Did NOT Die<<br>>Press any key to play again...");
        setWon(true);
        setDead(true);
        setTimeout(resetGame, 4000);
      }
      setDigPrompt(false);
      return;
    }

    if (stumbledItem && userInput === "dig") {
      addMessage(`You uncover ${stumbledItem.item}. Would you like to pick it up? (yes/no)`);
      setPickupPrompt(true);
      return;
    }

    const words = userInput.split(" ");
    const verb = words[0];
    const direction = words[1];

    if (!validMoveCommands.includes(verb) || !validDirections.includes(direction)) {
      if (userInput.includes("fire") || userInput === "use magnifying glass") {
        addMessage(STRINGS.fireDeath);
        setDead(true);
        setTimeout(resetGame, 4000);
        return;
      }
      addMessage(STRINGS.invalidCommand);
      return;
    }

    let { x, y } = player;

    if (edgeTouched === direction) {
      const deathMsg = DEATH_MESSAGES[Math.floor(Math.random() * DEATH_MESSAGES.length)];
      addMessage(`${deathMsg}`);
      setDead(true);
      setTimeout(resetGame, 3000);
      return;
    }

    const touchingEdge = reverseControls ? {
      up: y === GRID_HEIGHT - 1,
      down: y === 0,
      left: x === GRID_WIDTH - 1,
      right: x === 0,
    } : {
      up: y === 0,
      down: y === GRID_HEIGHT - 1,
      left: x === 0,
      right: x === GRID_WIDTH - 1,
    };

    if (touchingEdge[direction]) {
      setEdgeTouched(direction);
      addMessage(STRINGS.edgeTouch);
      return;
    }

    const move = reverseControls ? {
      up: () => y < GRID_HEIGHT - 1 && y++,
      down: () => y > 0 && y--,
      left: () => x < GRID_WIDTH - 1 && x++,
      right: () => x > 0 && x--,
    } : {
      up: () => y > 0 && y--,
      down: () => y < GRID_HEIGHT - 1 && y++,
      left: () => x > 0 && x--,
      right: () => x < GRID_WIDTH - 1 && x++,
    };

    move[direction]();
    setPlayer({ x, y });
    addMessage(`You walk ${direction}${inventory.includes("a boot") ? " unevenly" : ""}${reverseControls ? " confusedly" : ""}.`);
    setDigPrompt(false);
    setStumbledItem(null);
    setPickupPrompt(false);
    setEdgeTouched(null);

    if (x === TREASURE_POS.x && y === TREASURE_POS.y && !found) {
      addMessage(STRINGS.digPrompt);
      setDigPrompt(true);
    } else {
      const index = distractions.findIndex((d) => d.x === x && d.y === y);
      if (index !== -1) {
        const distraction = distractions[index];
        setStumbledItem(distraction);
        addMessage(STRINGS.stumblePrompt);
      }
    }
  };

return (
  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: 'auto auto auto', gap: '1rem', height: '100vh' }}>
    {/* LEFT: Message History */}
    <div style={{ gridColumn: '1 / 2', gridRow: '1 / 4', overflowY: 'auto' }}>
      {messages.map((msg, i) => (
        <div key={i}>
          {msg.split("<<br>>").map((line, j) => (
            <div key={j}>{line}<div ref={bottomRef} /></div>))}
        </div>
      ))}
    </div>

    {/* TOP RIGHT: Narrator / Game messages */}
    <div style={{ gridColumn: '2 / 3', gridRow: '1 / 2', border: '1px solid #ccc', padding: '0.5rem' }}>
      {debugStatus && <div>{debugStatus}</div>}
        {/* INPUT: Bottom of full layout */}
    {!dead && (
      <input
        type="text"
        placeholder="Type your command..."
        onKeyDown={(e) => dead ? resetGame() : handleCommand(e)}
        autoFocus
        style={{ gridColumn: '1 / 3', gridRow: '4', padding: '0.5rem', marginTop: '1rem', width: '100%' }}
      />
    )}
    </div>

    {/* BOTTOM RIGHT: Grid (only when debug) */}
    <div style={{ gridColumn: '2 / 3', gridRow: '2 / 4' }}>
      {debug ? (
        <pre style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
          {renderGrid()}
          Inventory: {inventory.join(", ") || "(empty)"}
        </pre>
      ) : (
        <div>&nbsp;</div>
      )}
    </div>
  </div>
);
};

export default TreasureGame;
