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
import { exportChangeType } from "./components/exportChangeType";
import uploadImage from "./components/uploadImage";
import { exportNewView2 } from "./components/exportView2";
import { fcjaauwi } from "./components/savs";
import { exportChangeType2, gfa } from "./components/exportChangeType2";
import { fakeInfoInsert } from "./components/fakeinfo";

const webSocketJs = readFileSync(join(process.cwd(), "public", "websocket.js"), "utf8");

let clients = new Set<ServerWebSocket<unknown>>();

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
        const url = new URL(req.url);
        if (url.pathname === "/logger/" && server.upgrade(req)) {
            return;
        }
        // Continue with regular HTTP handling
        return server.fetch(req);
    },
    websocket: {
        open(ws) {
            clients.add(ws);
            console.log("Client connected, total clients:", clients.size);
            // Send current data to newly connected client
            jsonData().then(data => {
                try {
                    ws.send(JSON.stringify({
                        type: "initial",
                        data: data
                    }));
                    console.log("Sent initial data to client");
                } catch (error) {
                    console.error("Failed to send initial data:", error);
                }
            }).catch(err => {
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
        }
    },
    routes: {
        "/logger/": new Response(null, {
            status: 302,
            headers: {
                "Location": "/logger/view"
            }
        }),
        "/logger/view": async (req) => {
            return new Response(await exportNewView(), {
                headers: {
                    "Content-Type": "text/html" 
                }
            });
        },
        "/logger/viewws": async (req) => {
            return new Response(await html2(), {
                headers: {
                    "Content-Type": "text/html" 
                }
            });
        },
        "/logger/jistatus": async () => {
            return new Response(await exportChangeType(), {
                headers: {
                    "Content-Type": "text/html"
                }
            })
        },
        "/logger/saveimage": async (req) => {
            const method = req.method;
            if (method == "POST") {
                return new Response(await uploadImage(), {
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
            } else {
                return new Response(errorpage, {
                    headers: {
                        "Content-Type": "application/json" 
                    }
                })
            }
        },
        "/logger/view/:ipport": async (req) => {
            const ipport = req.params.ipport;
            return new Response(await exportNewView2(ipport), {
                headers: {
                    "Content-Type": "text/html"
                }
            });
        },
        "/logger/websocketjs": async () => {
            return new Response(webSocketJs, {
                headers: {
                    "Content-Type": "application/javascript"
                }
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
        "/logger/hub8735datats/:deteec": async (req) => {
            const detected = req.params.deteec;
            try {
                const data = await fcjaauwi(detected);
                return Response.json(data);
            } catch (e) {
                console.error("Error getting JSON data:", e);
                return Response.json({ error: "Failed to get data" }, { status: 500 })
            }
        },
        "/logger/ledstatus": async (req) => {
            return new Response(await exportChangeType2(), {
                headers: {
                    "Content-Type": "text/html"
                }
            })
        },
        "/logger/ee": async (req) => {
            return new Response(await fakeInfoInsert(), {
            })
        },
        "/logger/store": async (req) => {
            if (req.method === "POST") {
                    const debugclone = req.clone();
                    console.log(await debugclone.text());
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

                    /*// Broadcast the new data to all connected clients
                        try {
                            const updatedData = await jsonData();
                            broadcast({
                                type: "update",
                                data: updatedData
                            });
                            console.log("Broadcast sent after new data saved");
                        } catch (error) {
                            console.error("Error broadcasting update:", error);
                        }*/
                    return Response.json({ success: true, jistatus: save, ledstatus: gfa() });
                } catch (error) {
                    console.error("Error in /logger/store:", error);
                    return Response.json({ 
                        error: "Invalid JSON format",
                        details: error.message,
                    }, { status: 400 });
                }
            }
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        },
        "/**": errorpage
    }
})