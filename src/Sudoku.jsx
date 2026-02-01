import React, { useState, useEffect, useRef } from "react";

/* ================== DATA ================== */

const puzzle = [
  ["5","3","","","7","","","",""],
  ["6","","","1","9","5","","",""],
  ["","9","8","","","","","6",""],
  ["8","","","","6","","","","3"],
  ["4","","","8","","","1","",""],
  ["7","","","","2","","","","6"],
  ["","6","","","","","2","8",""],
  ["","","","4","1","9","","","5"],
  ["","","","","8","","","7","9"]
];

const solution = [
  ["5","3","4","6","7","8","9","1","2"],
  ["6","7","2","1","9","5","3","4","8"],
  ["1","9","8","3","4","2","5","6","7"],
  ["8","5","9","7","6","1","4","2","3"],
  ["4","2","6","8","5","3","7","9","1"],
  ["7","1","3","9","2","4","8","5","6"],
  ["9","6","1","5","3","7","2","8","4"],
  ["2","8","7","4","1","9","6","3","5"],
  ["3","4","5","2","8","6","1","7","9"]
];

/* ================== COMPONENT ================== */

function Sudoku() {
  const bgMusicRef = useRef(null);

  const [board, setBoard] = useState(puzzle);
  const [lives, setLives] = useState(3);
  const [wrongCells, setWrongCells] = useState({});
  const [gameOver, setGameOver] = useState(false);

  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [seconds, setSeconds] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);

  const [playerName, setPlayerName] = useState("");
  const [gameStarted, setGameStarted] = useState(false);

  /* ========== BACKGROUND MUSIC ========== */
  useEffect(() => {
    bgMusicRef.current = new Audio("/bg-music.mp3");
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3;

    const playMusic = () => {
      bgMusicRef.current.play().catch(() => {});
      window.removeEventListener("click", playMusic);
    };

    window.addEventListener("click", playMusic);

    return () => bgMusicRef.current.pause();
  }, []);

  /* ========== TIMER ========== */
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  /* ========== KEYBOARD INPUT ========== */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedCell.row === null) return;

      const { row, col } = selectedCell;

      if (e.key >= "1" && e.key <= "9") {
        handleChange(row, col, e.key);
      }

      if (e.key === "ArrowUp" && row > 0) setSelectedCell({ row: row - 1, col });
      if (e.key === "ArrowDown" && row < 8) setSelectedCell({ row: row + 1, col });
      if (e.key === "ArrowLeft" && col > 0) setSelectedCell({ row, col: col - 1 });
      if (e.key === "ArrowRight" && col < 8) setSelectedCell({ row, col: col + 1 });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell]);

  /* ========== INPUT HANDLER ========== */
  function handleChange(row, col, value) {
    if (!/^[1-9]?$/.test(value)) return;
    if (puzzle[row][col] !== "" || gameOver) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = value;
    setBoard(newBoard);
  }

  /* ========== HINT ========== */
  function giveHint() {
    if (hintsLeft === 0 || selectedCell.row === null) return;

    const { row, col } = selectedCell;
    if (puzzle[row][col] !== "") return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = solution[row][col];
    setBoard(newBoard);
    setHintsLeft(h => h - 1);
  }

  /* ========== SUBMIT ========== */
  function handleSubmit() {
    let wrong = {};
    let hasError = false;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (puzzle[i][j] === "" && board[i][j] !== solution[i][j]) {
          wrong[`${i}-${j}`] = true;
          hasError = true;
        }
      }
    }

    if (hasError) {
      setWrongCells(wrong);
      setLives(l => l - 1);
      if (lives - 1 === 0) setGameOver(true);
    } else {
      alert("🎉 You solved it!");
    }
  }

  /* ========== RESTART ========== */
  function restartGame() {
    setBoard(puzzle);
    setLives(3);
    setWrongCells({});
    setGameOver(false);
    setSeconds(0);
    setHintsLeft(3);
  }

  /* ========== START SCREEN ========== */
  if (!gameStarted) {
    return (
      <div className="start-screen">
        <h2>Enter your name</h2>
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Your name"
        />
        <button onClick={() => setGameStarted(true)}>Start Game</button>
      </div>
    );
  }

  /* ========== UI ========== */
  return (
    <div className="game-bg">
      <div className="game-card">
        <h3>Player: {playerName}</h3>
        <p>Time: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</p>
        <p>Lives: {"❤️".repeat(lives)} | Hints: {hintsLeft}</p>

        <div className="sudoku-container">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <input
                key={`${r}-${c}`}
                className={`cell 
                  ${puzzle[r][c] !== "" ? "fixed" : ""}
                  ${selectedCell.row === r && selectedCell.col === c ? "selected" : ""}
                  ${wrongCells[`${r}-${c}`] ? "wrong" : ""}`}
                value={cell}
                disabled={puzzle[r][c] !== "" || gameOver}
                onClick={() => setSelectedCell({ row: r, col: c })}
                onChange={(e) => handleChange(r, c, e.target.value)}
              />
            ))
          )}
        </div>

        <button onClick={giveHint}>Hint</button>
        <button onClick={handleSubmit}>Submit</button>

        {/* Mobile keypad */}
        <div className="keypad">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} onClick={() =>
              selectedCell.row !== null &&
              handleChange(selectedCell.row, selectedCell.col, String(n))
            }>
              {n}
            </button>
          ))}
        </div>

        {gameOver && <button onClick={restartGame}>Restart</button>}
      </div>
    </div>
  );
}

export default Sudoku;
