import { sql } from "bun";
import index from "../index.html";
import errorpage from "../errorpage.html";
import { exportNewView } from "./components/exportView";
import { saveInfo } from "./components/saveInfo";


Bun.serve({
    port: 3000,
    routes: {
        "/logger/": index,
        "/logger/view": async (req) => {
            const stream = new ReadableStream({
                async start(controller) {
                    const content = await exportNewView();
                    controller.enqueue(content);
                    controller.close();
                }
            });
            
            return new Response(stream, {
                headers: {
                    "Content-Type": "text/html" 
                }
            });
        },
        "/logger/store": async (req) => {
            if (req.method === "POST") {
                try {
                    const data = await req.json();
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
                        data.local_detect
                    );
                    return Response.json({ success: true, save: save });
                } catch (error) {
                    return Response.json({ 
                        error: "Invalid JSON format",
                        details: error.message 
                    }, { status: 400 });
                }
            }
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        },
        "/**": errorpage
    }
})