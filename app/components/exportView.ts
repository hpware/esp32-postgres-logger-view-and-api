import { sql } from "bun"; 
import { jsonData } from "./jsonData";

const css = `
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary: #2563eb;
  --secondary: #64748b;
  --success: #22c55e;
  --warning: #f59e0b;
  --background: #f8fafc;
  --card: #ffffff;
}

body {
  background: var(--background);
  font-family: system-ui, -apple-system, sans-serif;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  text-align:center;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

section {
  background: var(--card);
  padding: 1em;
  border-radius: 12px;
  margin:1em;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  text-align:center;

}

h1 {
  font-size: 2rem;
  color: var(--primary);
  text-align: center;
  margin-bottom: 2rem;
}

h3 {
  color: var(--secondary);
  font-size: 1.25rem;
  margin-bottom: 1rem;
  align-items: center;
  text-align:center;
  gap: 0.5rem;
}

p {
  margin: 0.5rem 0;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
  text-align:center;
}

span {
  font-weight: 600;
  color: var(--primary);
}

ul {
  list-style: none;
}

li {
  padding: 0.5rem;
  margin: 0.25rem 0;
  border-radius: 6px;
  background: #f1f5f9;
}
`

export async function exportNewView(): Promise<string> {
    const data = await jsonData();
    // Get the most recent entry
    const latest = data.length > 0 ? data[0] : null;
    
    // Process detected items if they exist
    let detectedItems = [];
    if (latest && latest.local_detect) {
        try {
            const detected = JSON.parse(latest.local_detect);
            detectedItems = Array.isArray(detected) ? detected : [];
        } catch (e) {
            console.error("Error parsing detected items:", e);
        }
    }

    return `
    <!DOCTYPE html>
    <html>
        <head>
        <script src="/logger/websocketjs"></script>
        <style>
        ${css}
        </style>
        <body>
            <h1>顯示資料</h1>
            <section>
                <h3>氣象局</h3>
                <p>天氣狀態: <span data-value="cwa_type">${data?.cwa_type}</span></p>
                <p>氣溫: <span data-value="cwa_temp">${data?.cwa_temp || "N/A"}°C</span></p>
                <p>濕度: <span data-value="cwa_hum">${data?.cwa_hum || "N/A"}%</span></p>
                <p>最高氣溫: <span data-value="cwa_daily_high">${data?.cwa_daily_high || "N/A"}°C</span></p>
                <p>最低氣溫: <span data-value="cwa_daily_low">${data?.cwa_daily_low || "N/A"}°C</span></p>
            </section>
            <section>
                <h3>本地</h3>
                <p>氣溫: <span>${data?.local_temp || "N/A"}°C</span></p>
                <p>濕度: <span>${data?.local_hum || "N/A"}%</span></p>
                <p>蠕動馬達: <span>${data?.local_jistatus? "運轉中" : "停止"}</span></p>
             </section>
            <section>
                <h3>GPS 定位</h3>
                <p>經度: <span>${data?.local_gps_lat || "N/A"}</span></p>
                <p>緯度: <span>${data?.local_gps_long || "N/A"}</span></p>
            </section>
            <section>
                <h3>偵測到的物件</h3>
                <ul>
                    ${detectedItems
                        .map(item => `
                                <li>物件: ${item}</li>
                        `)
                        .join('') || "<li>無物件</li>"}
                </ul>
            </section>
        </body>
    </html>
    `
}