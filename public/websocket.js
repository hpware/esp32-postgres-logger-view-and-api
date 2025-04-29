// Create WebSocket connection
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const host = window.location.host;
// Make sure to use the same path as the server is using
const wsUrl = `${protocol}//${host}/logger/ws`; // Modified path to include 'ws' endpoint
let socket;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;

function connectWebSocket() {
  console.log("Attempting WebSocket connection to:", wsUrl);

  socket = new WebSocket(wsUrl);

  // Connection opened
  socket.addEventListener("open", (event) => {
    console.log("Connected to WebSocket server successfully!");
    reconnectAttempts = 0; // Reset reconnect attempts on successful connection

    // Dispatch a connected event
    document.dispatchEvent(new CustomEvent("ws-connected"));

    // Send initial request for data
    socket.send(JSON.stringify({ type: "request_data" }));
  });

  // Listen for messages
  socket.addEventListener("message", (event) => {
    console.log("Raw message received:", event.data);
    try {
      const message = JSON.parse(event.data);
      console.log("Message received from server:", message);

      // Handle any message with data
      if (message.data) {
        // Update your UI with the new data
        updateUI(message.data);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  });

  // Connection closed
  socket.addEventListener("close", (event) => {
    console.log("Disconnected from WebSocket server", event.code, event.reason);

    // Dispatch a disconnected event
    document.dispatchEvent(new CustomEvent("ws-disconnected"));

    // Attempt to reconnect after a delay
    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);
      setTimeout(() => {
        reconnectAttempts++;
        connectWebSocket();
      }, delay);
    } else {
      console.log("Max reconnect attempts reached. Giving up.");
    }
  });

  // Connection error
  socket.addEventListener("error", (event) => {
    console.error("WebSocket error:", event);
    console.log(
      "Check that the server is running and WebSocket path is correct",
    );
  });
}

// Function to update UI with new data
function updateUI(data) {
  console.log("Updating UI with data:", data);
  // Add fake data for testing if needed
  if (Object.keys(data).length === 0) {
    console.log("No data received, adding test data");
    data = {
      cwa_type: "晴天",
      cwa_temp: "25",
      cwa_hum: "65",
      cwa_daily_high: "28",
      cwa_daily_low: "22",
      local_temp: "26",
      local_hum: "60",
      local_jistatus: true,
      local_gps_lat: "25.0330",
      local_gps_long: "121.5654",
      detectedItems: ["人", "汽車", "自行車"],
    };
  }

  document.dispatchEvent(new CustomEvent("data-updated", { detail: data }));
}

// Initialize WebSocket connection when the page is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded, connecting WebSocket");
  connectWebSocket();
});

// If the document is already loaded, connect immediately
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  console.log("Document already loaded, connecting WebSocket");
  connectWebSocket();
}
