// Treasure Remake (Text-Only Version): ASCII-style exploration game in React

import { useEffect, useState } from "react";

const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;
const TREASURE_POS = { x: 7, y: 4 };
const INITIAL_DISTRACTIONS = [
  { x: 2, y: 2, item: "a boot" },
  { x: 4, y: 7, item: "a magnifying glass" },
  { x: 6, y: 1, item: "a towel" },
  { x: 1, y: 5, item: "a spear" },
  { x: 8, y: 8, item: "a black hole" },
];

const validMoveCommands = ["move", "go", "walk", "step"];
const validDirections = ["up", "down", "left", "right"];

const TreasureGame = () => {
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [message, setMessage] = useState("You are stranded on a desert island. Please indicate what you would like to do next...");
  const [found, setFound] = useState(false);
  const [digPrompt, setDigPrompt] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [distractions, setDistractions] = useState([...INITIAL_DISTRACTIONS]);
  const [reverseControls, setReverseControls] = useState(false);

  const handleCommand = (e) => {
    if (e.key !== "Enter") return;
    const input = e.target.value.trim().toLowerCase();
    e.target.value = "";

    const words = input.split(" ");
    const verb = words[0];
    const direction = words[1];

    if (digPrompt && verb === "dig") {
      setMessage("You found the treasure!");
      setFound(true);
      setDigPrompt(false);
      return;
    }

    if (!validMoveCommands.includes(verb) || !validDirections.includes(direction)) {
      if (input.includes("black hole")) {
        setMessage("You fall into the black hole and feel reality shift...");
        setReverseControls(true);
        setPlayer({ x: 0, y: 0 });
        setInventory([]);
        setDistractions([...INITIAL_DISTRACTIONS]);
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
    setMessage("Keep looking...");
    setDigPrompt(false);

    if (x === TREASURE_POS.x && y === TREASURE_POS.y && !found) {
      setMessage("You feel something beneath your feet... Type 'dig'.");
      setDigPrompt(true);
    } else {
      const index = distractions.findIndex((d) => d.x === x && d.y === y);
      if (index !== -1) {
        const distraction = distractions[index];
        const updated = distractions.filter((_, i) => i !== index);
        setDistractions(updated);

        switch (distraction.item) {
          case "a boot":
            setMessage("You picked up a boot and are transported to Hogwarts.");
            break;
          case "a magnifying glass":
            setMessage("You picked up a magnifying glass. Use it? (yes/no)");
            break;
          case "a towel":
            setMessage("An alien appears: 'Grab this towel and stick out your thumb. The planet is about to be destroyed.'");
            break;
          case "a spear":
            setMessage("You picked up a spear. Keep looking for the treasure.");
            break;
          case "a black hole":
            setMessage("You found a black hole... You wisely step back.");
            return;
          default:
            setMessage(`You picked up ${distraction.item}.`);
        }

        if (distraction.item !== "a black hole") {
          setInventory((prev) => [...prev, distraction.item]);
        }
      }
    }
  };

  const renderGrid = () => {
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

${renderGrid()}
Inventory: ${inventory.join(", ") || "(empty)"}
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
