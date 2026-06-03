const WebSocket = require("ws");
const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server running");
});

const wss = new WebSocket.Server({ server });

const players = {};

// =========================
// BROADCAST (GLOBAL SAFE)
// =========================
function broadcast() {
  const msg = JSON.stringify({
    type: "world",
    players
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });

  console.log("[BROADCAST]", msg);
}

// =========================
// CONNECTION
// =========================
wss.on("connection", (ws) => {

  const id = Math.random().toString(36).substring(2, 10);

  console.log("[CONNECT]", id);

  players[id] = { x: 0, y: 0 };

  // send init AFTER register
  ws.send(JSON.stringify({
    type: "init",
    id,
    players
  }));

  broadcast();

  // =========================
  // MESSAGE
  // =========================
  ws.on("message", (msg) => {

    try {
      const data = JSON.parse(msg);

      if (data.type === "move") {

        players[id] = {
          x: data.x,
          y: data.y
        };

        broadcast();
      }

    } catch (e) {
      console.log("[ERROR PARSE]", e);
    }
  });

  // =========================
  // DISCONNECT
  // =========================
  ws.on("close", () => {

    console.log("[DISCONNECT]", id);

    delete players[id];
    broadcast();
  });
});

server.listen(PORT, () => {
  console.log("Server running on", PORT);
});
