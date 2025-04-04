// Treasure Remake (Text-Only Version) with DEBUG toggle and narrative logic

import { useEffect, useState } from "react";

const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;
const getRandomPosition = () => ({ x: Math.floor(Math.random() * GRID_WIDTH), y: Math.floor(Math.random() * GRID_HEIGHT) });
let TREASURE_POS = getRandomPosition();
const DEBUG = true;

const DISTRACTION_ITEMS = ["a boot", "a magnifying glass", "a towel", "a spear", "a black hole"];
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

const validMoveCommands = ["move", "go", "walk", "step"];
const validDirections = ["up", "down", "left", "right"];

const TreasureGame = () => {
  const [player, setPlayer] = useState(getRandomEdgePosition());
  const [message, setMessage] = useState("You are stranded on a desert island. Please indicate what you would like to do next...");
  const [found, setFound] = useState(false);
  const [digPrompt, setDigPrompt] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [distractions, setDistractions] = useState(getRandomDistractions());
  const [reverseControls, setReverseControls] = useState(false);
  const [stumbledItem, setStumbledItem] = useState(null);
  const [pickupPrompt, setPickupPrompt] = useState(false);
  const [expectingAnswer, setExpectingAnswer] = useState(null);

  function resetGame() {
  TREASURE_POS = getRandomPosition();
  setPlayer(getRandomEdgePosition());
  setMessage("You are stranded on a desert island. Please indicate what you would like to do next...");
  setFound(false);
  setDigPrompt(false);
  setInventory([]);
  setDistractions(getRandomDistractions());
  setReverseControls(false);
  setStumbledItem(null);
  setPickupPrompt(false);
  setExpectingAnswer(null);
}

  function getRandomEdgePosition() {
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0: return { x: 0, y: Math.floor(Math.random() * GRID_HEIGHT) }; // left
      case 1: return { x: GRID_WIDTH - 1, y: Math.floor(Math.random() * GRID_HEIGHT) }; // right
      case 2: return { x: Math.floor(Math.random() * GRID_WIDTH), y: 0 }; // top
      case 3: return { x: Math.floor(Math.random() * GRID_WIDTH), y: GRID_HEIGHT - 1 }; // bottom
    }
  }

  const handleCommand = (e) => {
    if (e.key !== "Enter") return;
    const input = e.target.value.trim().toLowerCase();
    e.target.value = "";

    if (expectingAnswer === "meaning_of_life") {
      if (input === "42") {
        setMessage("Great - hold on tight and stick out your thumb. We are out of here losers");
      } else {
        setMessage("Sorry mate. See you in a different dimension.\nThe planet has been destroyed with you on it and you have died.");
        setTimeout(resetGame, 4000);
      }
      setExpectingAnswer(null);
      return;
    }

    if (expectingAnswer === "enter_black_hole") {
      if (input === "yes") {
        setMessage("You step into the black hole. Reality shifts. Everything feels strange.");
        setReverseControls(true);
        setExpectingAnswer(null);
      } else {
        setMessage("You step back from the black hole, leaving it untouched.");
        setExpectingAnswer(null);
      }
      return;
    }

    if (expectingAnswer === "hogwarts_choice") {
      if (input === "rock") {
        setMessage("You have been given the power to bring back the dead but you do not know what you are doing and brought back too many dead. They multiply and overrun planet Earth with their zombie legions. You die.");
        setTimeout(resetGame, 4000);
      } else if (input === "stick") {
        setMessage("You have been given the power of absolute power, but you get so crazy with power that you murder everyone alive and then die sad. You died. Sad.");
        setTimeout(resetGame, 4000);
      } else if (input === "poncho") {
        setMessage("You have been given the power to hide... True love grows and you have a marriage ceremony together. You commit to spend the rest of your lives together. And you do. But then you die. You are dead");
        setTimeout(resetGame, 8000);
      } else {
        setMessage("The witch doesn't understand your choice. Try: rock, stick, or poncho.");
      }
      return;
    }

    if (pickupPrompt) {
      if (input === "yes") {
        if (stumbledItem.item === "a black hole") {
          setMessage("You found a black hole... Do you want to enter it? (yes/no)");
          setExpectingAnswer("enter_black_hole");
          return;
        }

        if (stumbledItem.item === "a towel") {
          setMessage("Oh great, you have your towel. The planet is set to be destroyed to make way for an intergalactic highway. If you know the meaning of the universe, you can come with me. What is it?");
          setExpectingAnswer("meaning_of_life");
          return;
        }

        if (stumbledItem.item === "a boot") {
          setMessage("You are met by a magical witch. She is offering you one of three things: a rock, a stick, or a poncho.");
          setExpectingAnswer("hogwarts_choice");
          return;
        }

        setInventory((prev) => [...prev, stumbledItem.item]);
        setMessage(`You picked up ${stumbledItem.item}.`);
        setDistractions(distractions.filter(d => d !== stumbledItem));
        setStumbledItem(null);
        setPickupPrompt(false);
        return;
      } else if (input === "no") {
        setMessage("You leave it where it is.");
        setStumbledItem(null);
        setPickupPrompt(false);
        return;
      }
    }

    if (digPrompt && input === "dig") {
      if (inventory.includes("a spear")) {
        setMessage("A sacred protector arrives and attacks you. You are dead.");
        setTimeout(resetGame, 4000);
        return;
      } else {
        setMessage("A sacred protector arrives and grants you access to the treasure.");
        setFound(true);
        setDigPrompt(false);
        return;
      }
    } else {
        setMessage("The sacred protector arrives and grants you access to the treasure! You win!");
        setFound(true);
        setDigPrompt(false);
        return;
      }
    }

    if (stumbledItem && input === "dig") {
      setMessage(`You uncover ${stumbledItem.item}. Would you like to pick it up? (yes/no)`);
      setPickupPrompt(true);
      return;
    }

    const words = input.split(" ");
    const verb = words[0];
    const direction = words[1];

    if (!validMoveCommands.includes(verb) || !validDirections.includes(direction)) {
      if (input.includes("fire") || input === "use magnifying glass") {
        setMessage("You set the island on fire and burn to death. You died.");
        setTimeout(resetGame, 4000);
        return;
      }
      setMessage("I am sorry. I do not understand that command");
      return;
    }
      setMessage("I am sorry. I do not understand that command");
      return;
    }

    let { x, y } = player;
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
    setMessage(`You walk ${direction}${inventory.includes("a boot") ? " unevenly" : ""}${reverseControls ? " confusedly" : ""}.`);
    setDigPrompt(false);
    setStumbledItem(null);
    setPickupPrompt(false);

    if (x === TREASURE_POS.x && y === TREASURE_POS.y && !found) {
      setMessage("You feel something beneath your feet... Type 'dig'.");
      setDigPrompt(true);
    } else {
      const index = distractions.findIndex((d) => d.x === x && d.y === y);
      if (index !== -1) {
        const distraction = distractions[index];
        setStumbledItem(distraction);
        setMessage("You stumbled on something. Type 'dig' to check it out.");
      }
    }
  };

  const renderGrid = () => {
    if (!DEBUG) return "";
    let output = "";
    for (let y = 0; y < GRID_HEIGHT; y++) {
      let row = "";
      for (let x = 0; x < GRID_WIDTH; x++) {
        const isPlayer = player.x === x && player.y === y;
        const isTreasure = TREASURE_POS.x === x && TREASURE_POS.y === y && found;
        const isDistraction = distractions.some((d) => d.x === x && d.y === y);
        if (isPlayer) {
          row += "P";
        } else if (isTreasure) {
          row += "T";
        } else if (isDistraction) {
          row += "*";
        } else {
          row += ".";
        }
      }
      output += row + "\n";
    }
    return output;
  };

  return (
    <div>
      <pre>{`
=== TREASURE ===
${message}

${DEBUG ? renderGrid() + "\nInventory: " + (inventory.join(", ") || "(empty)") : ""}
`}</pre>
      <input
        type="text"
        placeholder="Type your command..."
        onKeyDown={handleCommand}
        autoFocus
      />
    </div>
  );
};

export default TreasureGame;
