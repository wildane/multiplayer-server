const WebSocket = require("ws");
const http = require("http");

const PORT = process.env.PORT;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running");
});

const wss = new WebSocket.Server({ server });

const players = {};

wss.on("connection", (ws) => {
  const id = Math.random().toString(36).substr(2, 9);

  players[id] = { x: 0, y: 0 };

  ws.send(JSON.stringify({ type: "init", id, players }));

  broadcast();

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "move") {
      players[id] = { x: data.x, y: data.y };
      broadcast();
    }
  });

  ws.on("close", () => {
    delete players[id];
    broadcast();
  });

  function broadcast() {
    const msg = JSON.stringify({
      type: "world",
      players
    });

    wss.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN) {
        c.send(msg);
      }
    });
  }
});

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
