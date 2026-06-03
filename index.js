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
// BROADCAST (CLEAN LOG)
// =========================
function broadcast() {
  const count = Object.keys(players).length;

  console.log("[BROADCAST] players =", count);

  const msg = JSON.stringify({
    type: "world",
    players
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// =========================
// CONNECTION
// =========================
wss.on("connection", (ws) => {

  const id = Math.random().toString(36).substring(2, 10);

  console.log("[CONNECT]", id);

  players[id] = { x: 0, y: 0 };

  console.log("[STATE AFTER CONNECT]", Object.keys(players));

  // send init (server assigned id)
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

    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      return;
    }

    if (data.type === "move") {

      players[id] = {
        x: data.x,
        y: data.y
      };

      broadcast();
    }
  });

  // =========================
  // DISCONNECT
  // =========================
  ws.on("close", () => {

    console.log("[DISCONNECT]", id);

    delete players[id];

    console.log("[STATE AFTER DISCONNECT]", Object.keys(players));

    broadcast();
  });
});

server.listen(PORT, () => {
  console.log("🔥 SERVER STARTED ON PORT", PORT);
});
