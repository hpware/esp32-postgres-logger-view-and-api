import { sql } from "bun";
import { saveInfo } from "./components/saveInfo";
import { readFileSync } from "fs";
import { join, matchesGlob } from "path";
import { jsonData } from "./components/jsonData";
import { exportChangeType, getJiStatus } from "./components/exportChangeType";
import uploadImage from "./components/uploadImage";
import { exportNewView2 } from "./components/exportView2";
import { fcjaauwi } from "./components/savs";
import { exportChangeType2, gfa } from "./components/exportChangeType2";
import getDevices from "./components/getDevices";

const errorpage = readFileSync(
  join(process.cwd(), "app", "errorpage.html"),
  "utf8",
);

const indexpage = readFileSync(
  join(process.cwd(), "app", "home.html"),
  "utf8",
);

type RouteHandler = (req: Request) => Promise<Response> | Response;

Bun.serve({
  port: 3000,
  development: true,
  routes: {
    "/logger/": () => new Response(indexpage, {
      headers: { "Content-Type": "text/html" },
    }),
    "/logger": () => new Response(indexpage, {
      headers: { "Content-Type": "text/html" },
    }),
    "/": () => new Response(indexpage, {
      headers: { "Content-Type": "text/html" },
    }),
    "/logger/jistatus": async () => {
      return new Response(await exportChangeType(), {
        headers: {
          "Content-Type": "text/html",
        },
      });
    },
    "/logger/devices": async () => {
      const devices = await getDevices();
      return new Response(JSON.stringify(devices), {
        headers: {
          "Content-Type": "application/json",
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
          .then((data) => {
            console.log("Data processing completed:", data);
          })
          .catch((e) => {
            console.error("Error processing data:", e);
          });
  
        return response;
      } else {
        return Response.json(
          { error: "You are not using a POST request." },
          { status: 403 },
        );
      }
    },
    "/logger/createdbase": async () => {
      const create1 = await sql`
  CREATE TABLE IF NOT EXISTS logger (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      cwa_type VARCHAR(50),
      cwa_location VARCHAR(100),
      cwa_temp DECIMAL(5,2),
      cwa_hum DECIMAL(5,2),
      cwa_daily_high DECIMAL(5,2),
      cwa_daily_low DECIMAL(5,2),
      local_temp DECIMAL(5,2),
      local_hum DECIMAL(5,2),
      local_gps_lat VARCHAR(20),
      local_gps_long VARCHAR(20),
      local_time TIMESTAMPTZ,
      local_jistatus BOOLEAN,
      local_light BOOLEAN,
      local_detect JSONB
  );
  `;
  
      const create2 = await sql`
  CREATE TABLE IF NOT EXISTS detect (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      item text not null,
      imageURL text not null,
      detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )
  `;
  
      const create3 = await sql`
  create table if not exists jistatus (
      id SERIAL PRIMARY KEY,
      status boolean not null
  )
  `;
      return new Response("Database created successfully", {
        headers: {
          "Content-Type": "text/plain",
        },
      });
    },
    "/logger/ledstatus": async (req: Request) => {
      return new Response(await exportChangeType2(), {
        headers: {
          "Content-Type": "text/html",
        },
      });
    },
    "/logger/createdatabase": async () => {
      const create1 = await sql`
  CREATE TABLE IF NOT EXISTS logger (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      cwa_type VARCHAR(50),
      cwa_location VARCHAR(100),
      cwa_temp DECIMAL(5,2),
      cwa_hum DECIMAL(5,2),
      cwa_daily_high DECIMAL(5,2),
      cwa_daily_low DECIMAL(5,2),
      local_temp DECIMAL(5,2),
      local_hum DECIMAL(5,2),
      local_gps_lat VARCHAR(20),
      local_gps_long VARCHAR(20),
      local_time TIMESTAMPTZ,
      local_jistatus BOOLEAN,
      local_light BOOLEAN,
      local_detect JSONB
  );
  `;
  
      const create2 = await sql`
  CREATE TABLE IF NOT EXISTS detect (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      item text not null,
      imageURL text not null,
      detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )
  `;
  
      const create3 = await sql`
  create table if not exists jistatus (
      id SERIAL PRIMARY KEY,
      status boolean not null
  )
  `;
      return new Response("Database created successfully", {
        headers: {
          "Content-Type": "text/plain",
        },
      });
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
    "/**": async (req: Request) => {
      return new Response(errorpage, {
        headers: { "Content-Type": "text/html" },
      });
    }
  },
});