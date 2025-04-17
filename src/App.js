import React, { useState, useEffect } from "react";

const gridSize = 10;
const totalPlastic = 10;
const totalNet = 5;
const colors = ["red", "green", "blue", "yellow"];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const generateEmptyGrid = () => {
  return Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => ({
      color: getRandomColor(),
      isSelected: false,
    }))
  );
};

const App = () => {
  const [grid, setGrid] = useState(generateEmptyGrid);
  const [selected, setSelected] = useState([]);
  const [plastics, setPlastics] = useState([]);
  const [nets, setNets] = useState([]);

  const isValidPollutionPosition = (x, y) =>
    x > 1 &&
    x < gridSize - 2 &&
    y > 1 &&
    y < gridSize - 2 &&
    !plastics.some((p) => p[0] === x && p[1] === y) &&
    !nets.some((n) => n[0] === x && n[1] === y);

  const placePollution = () => {
    const newPlastics = [];
    const newNets = [];

    while (newPlastics.length < totalPlastic) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      if (isValidPollutionPosition(x, y)) {
        newPlastics.push([x, y]);
      }
    }

    while (newNets.length < totalNet) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      if (isValidPollutionPosition(x, y)) {
        newNets.push([x, y]);
      }
    }

    setPlastics(newPlastics);
    setNets(newNets);
  };

  const isStraightLine = (dx, dy) => dx === 0 || dy === 0;

  // Function to check if it's a diagonal (45°)
  const isDiagonal = (dx, dy) => Math.abs(dx) === Math.abs(dy);

  // Updated to support diagonal lines (45°)
  const getLineCells = (x1, y1, x2, y2) => {
    const line = [];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.max(Math.abs(dx), Math.abs(dy));
    const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
    const stepY = dy === 0 ? 0 : dy / Math.abs(dy);

    for (let i = 0; i <= length; i++) {
      line.push([x1 + i * stepX, y1 + i * stepY]);
    }
    return line;
  };

  const applyGravity = (grid) => {
    const newGrid = [...Array(gridSize)].map(() =>
      [...Array(gridSize)].map(() => ({
        color: null,
        isSelected: false,
      }))
    );

    for (let x = 0; x < gridSize; x++) {
      let col = [];
      for (let y = gridSize - 1; y >= 0; y--) {
        const cell = grid[y][x];
        if (cell.color !== null) col.push({ ...cell });
      }

      for (let y = gridSize - 1; y >= 0; y--) {
        newGrid[y][x] = col[gridSize - 1 - y] || {
          color: getRandomColor(),
          isSelected: false,
        };
      }
    }

    return newGrid;
  };

  const handleClick = (x, y) => {
    const isPlastic = plastics.some(([px, py]) => px === x && py === y);
    const isNet = nets.some(([nx, ny]) => nx === x && ny === y);
    const isCoveredByNet = nets.some(
      ([nx, ny]) =>
        (nx === x && Math.abs(ny - y) === 1) ||
        (ny === y && Math.abs(nx - x) === 1)
    );
    if (isPlastic || isNet || isCoveredByNet) return;

    const cell = grid[y][x];
    if (selected.length === 1 && selected[0][0] === x && selected[0][1] === y) {
      setSelected([]);
      return;
    }

    if (selected.length === 0) {
      setSelected([[x, y]]);
    } else if (selected.length === 1) {
      const [x1, y1] = selected[0];
      const dx = x - x1;
      const dy = y - y1;
      if (!isStraightLine(dx, dy) && !isDiagonal(dx, dy)) return; // Now includes diagonal check
      if (grid[y1][x1].color !== cell.color) return;

      const lineCells = getLineCells(x1, y1, x, y);
      const color = grid[y1][x1].color;
      let anyRemoved = false;

      const newGrid = grid.map((row, rowY) =>
        row.map((cell, colX) => {
          const inLine = lineCells.some(
            ([lx, ly]) => lx === colX && ly === rowY
          );
          if (inLine && grid[rowY][colX].color === color) {
            anyRemoved = true;
            return { color: null, isSelected: false };
          }
          return { ...cell, isSelected: false };
        })
      );

      // 同步删除污染物（污染物不移动）
      const newPlastics = plastics.filter(([px, py]) => {
        const cellColor = grid[py][px].color;
        return !lineCells.some(
          ([lx, ly]) => lx === px && ly === py && cellColor === color
        );
      });

      const newNets = nets.filter(([nx, ny]) => {
        const cellColor = grid[ny][nx].color;
        return !lineCells.some(
          ([lx, ly]) => lx === nx && ly === ny && cellColor === color
        );
      });

      if (anyRemoved) {
        const dropped = applyGravity(newGrid);
        setGrid(dropped);
        setPlastics(newPlastics);
        setNets(newNets);
      }

      setSelected([]);
    }
  };

  useEffect(() => {
    placePollution();
    setGrid(generateEmptyGrid());
  }, []);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h2>♻️ 固定污染物清除</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 40px)`,
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const isPlastic = plastics.some(([px, py]) => px === x && py === y);
            const isNet = nets.some(([nx, ny]) => nx === x && ny === y);
            const isCoveredByNet = nets.some(
              ([nx, ny]) =>
                (nx === x && Math.abs(ny - y) === 1) ||
                (ny === y && Math.abs(nx - x) === 1)
            );

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => handleClick(x, y)}
                style={{
                  width: 38,
                  height: 38,
                  margin: 1,
                  backgroundColor: cell.color || "white",
                  border: selected.some(([sx, sy]) => sx === x && sy === y)
                    ? "2px solid black"
                    : "1px solid #ccc",
                  opacity: isNet
                    ? 0.5
                    : isCoveredByNet
                    ? 0.5
                    : isPlastic
                    ? 0.5
                    : 1,
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {isPlastic && (
                  <span
                    role="img"
                    style={{ position: "absolute", top: 4, left: 4 }}
                  >
                    🍼
                  </span>
                )}
                {isNet && (
                  <span
                    role="img"
                    style={{ position: "absolute", top: 4, left: 4 }}
                  >
                    🥅
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default App;
