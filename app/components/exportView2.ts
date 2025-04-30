import { sql } from "bun";
import { fcja } from "./savs";
import { gfa } from "./exportChangeType2";

function formatTime(utc: String) {
  const date = new Date(utc);
  return date.toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

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
  a {
    text-decoration: none;
  }
}
button {
  background-color: var(--primary);
  color:white;
  padding: 10px;
  border-radius: 10px;
  border: 0;
  transition: all 300ms ease-in-out;
}
button:hover {
  color: white;
  background-color:rgb(31, 80, 185);
}
`;

export async function exportNewView2(ipport: string) {
  const latestData = await sql`
    SELECT * FROM logger 
    ORDER BY id DESC 
    LIMIT 1
`;

  const getList = await sql`
      SELECT * from detect
      order by id DESC
    `;

  const data = latestData[0];
  const detectedItems = JSON.parse(data?.local_detect || "[]");

  return `
  <!doctype html>
<html>
  <head>
    <title>AIOT 生態物種即使監測回報裝置網頁系統</title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="og:author:email" content="hw@yuanhau.com" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <style>
    ${css}
  </style>
  <script>
    console.log("ID: ${data?.id}");
    console.log("Date: ${formatTime(String(data?.created_at))}");
  </script>
  <body>
    <h1>顯示資料</h1>
    <a href="http://${ipport}"><button>即使影像</button></a>
    <section>
      <h3>氣象局</h3>
      <p>測站: <span id="test_station">${data?.cwa_location || "N/A"}</span></p>
      <p>天氣狀態: <span id="type">${data?.cwa_type || "N/A"}</span></p>
      <p>氣溫: <span id="temp">${data?.cwa_temp ?? "N/A"}°C</span></p>
      <p>濕度: <span id="hum">${data?.cwa_hum ?? "N/A"}%</span></p>
      <p>
        最高氣溫 <span id="daily_high">${data?.cwa_daily_high ?? "N/A"}°C</span>
      </p>
      <p>
        最低氣溫 <span id="daily_low">${data?.cwa_daily_low ?? "N/A"}°C</span>
      </p>
    </section>
    <section>
      <h3>本地</h3>
      <p>氣溫: <span id="local_temp">${data?.local_temp ?? "N/A"}°C</span></p>
      <p>濕度: <span id="local_hum">${data?.local_hum ?? "N/A"}%</span></p>
      <p>
        蠕動馬達:
        <span id="motor_status"
          >${data?.local_jistatus ? "運轉中" : "停止"}</span
        >
      </p>
      <p>紅外線: <span id="light">${gfa() ? "關" : "開"}</span></p>
      <p>
        蠕動馬達 ${data?.local_jistatus ? "<button onclick='fetchRemote()'>關</button>" : '<button onclick="fetchRemote()">開</button>'}</p>
      <p>
        紅外線 ${gfa() ? '<button onclick="fetchGFA()">關</button>' : '<button onclick="fetchGFA()">開</button>'}
      </p>
    </section>
    <section>
      <h3>GPS 定位</h3>
      <p>經度: <span id="gps_lat">${data?.local_gps_lat || "N/A"}</span></p>
      <p>緯度: <span id="gps_long">${data?.local_gps_long || "N/A"}</span></p>
    </section>
    <section>
      <h3>偵測到的物種</h3>
      <ul id="detected_list">
        <!--${String(getList)}-->
        ${
          fcja().length > 0
            ? fcja()
                .map(
                  (item) => `
        <li>
          <a href="${item.imageURL}"
            ><div>
              <span>${item.item}</span>
              <br />
              偵測時間: ${formatTime(String(item?.time))}
              <br />
              <!--${item}-->
            </div></a
          >
        </li>
        `,
                )
                .join("")
            : `
        <li>尚未偵測到物種</li>
        `
        }
      </ul>
    </section>
  </body>
  <script>
    let cwaType = document.getElementById("type").innerText;
    let cwaTemp = document.getElementById("temp").innerText;
    let cwaHum = document.getElementById("hum").innerText;
    let cwaDailyHigh = document.getElementById("daily_high").innerText;
    let cwaDailyLow = document.getElementById("daily_low").innerText;
    let localTemp = document.getElementById("local_temp").innerText;
    let localHum = document.getElementById("local_hum").innerText;
    let motorStatus = document.getElementById("motor_status").innerText;
    let gpsLat = document.getElementById("gps_lat").innerText;
    let gpsLong = document.getElementById("gps_long").innerText;
    let detectedList = document.getElementById("detected_list").innerText;
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
    const socket = new WebSocket("wss://zb-logger.sch2.top/logger/");
    socket.addEventListener("message", (event) => {
      console.log(event.data);
      console.log(event.id);
      console.log(event.created_at);
      cwaType = event.cwa_type;
      cwaTemp = event.cwa_temp;
      cwaHum = event.cwa_hum;
      cwaDailyHigh = event.cwa_daily_high;
      cwaDailyLow = event.cwa_daily_low;
      localTemp = event.local_temp;
      localHum = event.local_hum;
      motorStatus = event.local_jistatus;
      gpsLat = event.local_gps_lat;
      gpsLong = event.local_gps_long;
      detectedList = event.local_detect;
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
    });
    async function fetchRemote() {
      const req = await fetch("/logger/jistatus");
      const res = await req.text();
      alert("已發送到伺服器");
      return res;
    }
    async function fetchGFA() {
      const req = await fetch("/logger/ledstatus");
      const res = await req.text();
      alert("已發送到伺服器");
      return res;
    }
  </script>
</html>

    `;
}
