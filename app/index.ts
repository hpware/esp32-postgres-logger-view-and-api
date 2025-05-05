import { sql } from "bun";
import type { ServerWebSocket } from "bun";
import index from "./index.html";
import errorpage from "./errorpage.html";
import html2 from "./components/html";
import { saveInfo } from "./components/saveInfo";
import { readFileSync } from "fs";
import { join, matchesGlob } from "path";
import { jsonData } from "./components/jsonData";
import exportNewVideoView from "./components/exportVideoView";
import { exportNewView } from "./components/exportView";
import { exportChangeType, getJiStatus } from "./components/exportChangeType";
import uploadImage from "./components/uploadImage";
import { exportNewView2 } from "./components/exportView2";
import { fcjaauwi } from "./components/savs";
import { exportChangeType2, gfa } from "./components/exportChangeType2";
import { fakeInfoInsert } from "./components/fakeinfo";

const webSocketJs = readFileSync(
  join(process.cwd(), "public", "websocket.js"),
  "utf8",
);

let clients = new Set<ServerWebSocket<unknown>>();

type RouteHandler = (req: Request) => Promise<Response> | Response;

const routes: Record<string, RouteHandler> = {
  "/logger/": () =>
    new Response(null, {
      status: 302,
      headers: {
        Location: "/logger/view",
      },
    }),
  "/logger/view": () =>
    new Response(null, {
      status: 302,
      headers: {
        Location: "/logger/view/192.168.1.3",
      },
    }),
  "/logger/jistatus": async () => {
    return new Response(await exportChangeType(), {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
  "/logger/saveimage": async (req: Request) => {
    const method = req.method;
    if (method == "POST") {
      return new Response(await uploadImage(), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      return new Response(errorpage, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  },
  "/logger/view/:ipport": async (req: Request) => {
    console.log(req);
    const ipport = req.params.ipport;
    return new Response(await exportNewView2(ipport), {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
  "/logger/websocketjs": async () => {
    return new Response(webSocketJs, {
      headers: {
        "Content-Type": "application/javascript",
      },
    });
  },
  "/logger/json": async () => {
    try {
      const data = await jsonData();
      return Response.json(data);
    } catch (error) {
      console.error("Error getting JSON data:", error);
      return Response.json({ error: "Failed to get data" }, { status: 500 });
    }
  },
  "/logger/hub8735datats/:deteec": async (req: Request) => {
      const detected = req.params.deteec;
      const body = req.body;
      if (req.method === "POST") {
        // Return response immediately
        const response = Response.json({ status: "Processing" });
        
        // Process data in background
        fcjaauwi(detected, body)
          .then(data => {
            console.log("Data processing completed:", data);
          })
          .catch(e => {
            console.error("Error processing data:", e);
          });
  
        return response;
      } else {
        return Response.json({ error: "You are not using a POST request." }, { status: 403 });
      }
    },
  "/logger/ledstatus": async (req: Request) => {
    return new Response(await exportChangeType2(), {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
  "/logger/ee": async (req: Request) => {
    return new Response(await fakeInfoInsert(), {});
  },
  "/logger/store": async (req: Request) => {
    if (req.method === "POST") {
      console.log(req);
      try {
        const clone = req.clone();
        const data = await clone.json();
        const save = await saveInfo(
          data.cwa_type,
          data.cwa_location,
          data.cwa_temp,
          data.cwa_hum,
          data.cwa_daliyHigh,
          data.cwa_daliyLow,
          data.local_temp,
          data.local_hum,
          data.local_gps_lat,
          data.local_gps_long,
          data.local_time,
          data.local_jistatus,
          data.local_detect,
        );

        /// Broadcast the new data to all connected clients
        try {
          const updatedData = await jsonData();
          broadcast(updatedData);
          console.log("Broadcast sent after new data saved");
        } catch (error) {
          console.error("Error broadcasting update:", error);
        }
        return Response.json({
          success: true,
          jistatus: save,
          ledstatus: gfa(),
        });
      } catch (error) {
        console.error("Error in /logger/store:", error);
        return Response.json(
          {
            error: "Invalid JSON format",
            details: error.message,
            success: true,
            jistatus: getJiStatus(),
            ledstatus: gfa(),
          },
          { status: 400 },
        );
      }
    }
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  },
};

function broadcast(message: any) {
  console.log(`Broadcasting to ${clients.size} clients`);
  for (const client of clients) {
    try {
      client.send(JSON.stringify(message));
    } catch (error) {
      console.error("Failed to send to a client:", error);
    }
  }
}

Bun.serve({
  port: 3000,
  fetch(req, server) {
    const success = server.upgrade(req);
    if (success) {
      return;
    }
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/$/, "");
    const handler = routes[path];

    if (typeof handler === "function") {
      try {
        return handler(req);
      } catch (error) {
        console.error("Route handler error:", error);
        return Response.json(
          { error: "Internal server error" },
          { status: 500 },
        );
      }
    }
    return new Response("Not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      clients.add(ws);
      console.log("Client connected, total clients:", clients.size);
      // Send current data to newly connected client
      jsonData()
        .then((data) => {
          try {
            ws.send(JSON.stringify(data));
            console.log("Sent initial data to client");
          } catch (error) {
            console.error("Failed to send initial data:", error);
          }
        })
        .catch((err) => {
          console.error("Error getting JSON data:", err);
        });
    },
    close(ws) {
      clients.delete(ws);
      console.log("Client disconnected, total clients:", clients.size);
    },
    message(ws, message) {
      try {
        const data = JSON.parse(message.toString());
        console.log("Received message:", data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    },
  },
  routes: {
    "/logger/view/:ipport": async (req: Request) => {
      const ipport = (req as any).params.ipport;
      return new Response(await exportNewView2(ipport), {
        headers: { "Content-Type": "text/html" },
      });
    },
    "/logger/hub8735datats/:deteec": async (req: Request) => {
      const detected = req.params.deteec;
      const body = req.body;
      if (req.method === "GET") {
        // Return response immediately
        const response = Response.json({ status: "Processing" });
        
        // Process data in background
        fcjaauwi(detected, body)
          .then(data => {
            console.log("Data processing completed:", data);
          })
          .catch(e => {
            console.error("Error processing data:", e);
          });
  
        return response;
      } else {
        return Response.json({ error: "You are not using a POST request." }, { status: 403 });
      }
    },
  },
});
