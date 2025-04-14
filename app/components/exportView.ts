import { sql } from "bun"; 


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

export async function exportNewView() {

    const latestData = await sql`
    SELECT * FROM logger 
    ORDER BY id DESC 
    LIMIT 1
`;

    const data = latestData[0]
    const detectedItems = JSON.parse(data?.local_detect || '[]');
    
    console.log(data);
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <title>View database info</title>
            <meta charset="UTF-8"/>
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="og:author:email" content="hw@yuanhau.com">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="refresh" content="30, ''"/>s
        </head>
         <style>
        ${css}
        </style>
        <script>
        console.log("ID: ${data?.id}");
        console.log("Date: ${data?.created_at}")
        </script>
        <body>
            <h1>顯示資料</h1>
            <!--時間: ${data?.created_at}-->
            <!--ID: ${data?.id}-->
            <section>
                    <h3>氣象局</h3>
                    <p>測站: <span id="test_station">${data?.cwa_location || "N/A"}</span></p>
                    <p>天氣狀態: <span id="type">${data?.cwa_type || "N/A"}</span></p>
                    <p>氣溫: <span id="temp">${data?.cwa_temp ?? "N/A"}°C</span></p>
                    <p>濕度: <span id="hum">${data?.cwa_hum ?? "N/A"}%</span></p>
                    <p>最高氣溫 <span id="daily_high">${data?.cwa_daily_high ?? "N/A"}°C</span></p>
                    <p>最低氣溫 <span id="daily_low">${data?.cwa_daily_low ?? "N/A"}°C</span></p>
                </section>
                <section>
                    <h3>本地</h3>
                    <p>氣溫: <span id="local_temp">${data?.local_temp ?? "N/A"}°C</span></p>
                    <p>濕度: <span id="local_hum">${data?.local_hum ?? "N/A"}%</span></p>
                    <p>蠕動馬達: <span id="motor_status">${data?.local_jistatus ? "運轉中" : "停止"}</span></p>
                    <p>蠕動馬達 ${
                      data?.local_jistatus ? "<button onclick='fetchRemote()'>關</button>" : "<button onclick='fetchRemote()'>開</button>"
                    }
                 </section>
                <section>
                    <h3>GPS 定位</h3>
                    <p>經度: <span id="gps_lat">${data?.local_gps_lat || "N/A"}</span></p>
                    <p>緯度: <span id="gps_long">${data?.local_gps_long || "N/A"}</span></p>
                </section>
                <section>
                    <h3>偵測到的鳥</h3>
                    <ul id="detected_list">
                        ${
                          detectedItems.length > 0
                            ? detectedItems
                                .map((item) => `<li> ${item}</li>`)
                                .join("")
                            : "<li>沒有偵測到</li>"
                        }
                    </ul>
            </section>
        </body>
          <script>
                console.log("DOM fully loaded and parsed.");
                  const cwaType = document.getElementById("type");
                  const cwaTemp = document.getElementById("temp");
                  const cwaHum =  document.getElementById("hum");
                  const cwaDailyHigh = document.getElementById("daily_high");
                  const cwaDailyLow = document.getElementById("daily_low");
                  const localTemp = document.getElementById("local_temp");
                  const localHum = document.getElementById("local_hum");
                  const motorStatus = document.getElementById("motor_status");
                  const gpsLat = document.getElementById("gps_lat");
                  const gpsLong = document.getElementById("gps_long");
                  const detectedList = document.getElementById("detected_list")
                };
                console.log(cwaType);
                console.log(cwaTemp);
                console.log(cwaHum);
                console.log(cwaDailyHigh);
                console.log(cwaDailyLow);
                console.log(localTemp);
                console.log(localHum);
                console.log(motorStatus);
                console.log(gpsLat);
                console.log(gpsLong);
                console.log(detectedList);
          </script>
          <script>
                  async function fetchRemote() {
                        const req = await fetch("/logger/jistatus/${data?.local_jistatus}");
                        const res = await req.text();
                        console.log(res);
                        return res;
                  }
          </script>
    </html>
    `
}