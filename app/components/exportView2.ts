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
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

  </head>
  <script>
    console.log("ID: ${data?.id}");
    console.log("Date: ${formatTime(String(data?.created_at))}");
  </script>
  <body class="justify-center align-center text-center selection:opactiy-[50%] p-1 bg-[url(https://raw.githubusercontent.com/hpware/esp32-postgres-logger-view-and-api/refs/heads/main/public/bg.jpg)] bg-cover bg-no-repeat bg-center">
    <h1 class="text-4xl bg-white m-4 p-2 text-transparent text-center align-middle justify-center bg-clip-text backdrop-blur-lg shadow-lg shadown-gray-200 border border-white rounded-3xl flex flex-col">顯示資料</h1>
    <a href="http://${ipport}"><button class="bg-blue-200/70 p-2 rounded-xl hover:bg-blue-300/40 transition-all duration-300">即使影像</button></a>
    <section class="bg-gray-200/70 p-4 m-4 min-w-1/3 md:w-fit w-full mx-auto rounded-lg shadow-lg backdrop-blur-sm gap-2 m-3">
      <h3 class="text-3xl text-bold">氣象局</h3>
      <hr/>
      <p class="p-2 bg-white/60 rounded-2xl m-3 backdrop-blur-sm">測站: <span class="text-yellow-800" id="test_station">${data?.cwa_location || "N/A"}</span></p>
      <p class="p-2 bg-white/60 rounded-2xl m-3 backdrop-blur-sm">天氣狀態: <span class="text-yellow-800" id="type">${data?.cwa_type || "N/A"}</span></p>
      <p class="p-2 bg-white/60 rounded-2xl m-3 backdrop-blur-sm">氣溫: <span class="text-yellow-800" id="temp">${data?.cwa_temp ?? "N/A"}°C</span></p>
      <p class="p-2 bg-white/60 rounded-2xl m-3 backdrop-blur-sm">濕度: <span class="text-yellow-800" id="hum">${data?.cwa_hum ?? "N/A"}%</span></p>
      <p class="p-2 bg-white/60 rounded-2xl m-3 backdrop-blur-sm">
        最高氣溫 <span class="text-yellow-800" id="daily_high">${data?.cwa_daily_high ?? "N/A"}°C</span>
      </p>
      <p class="p-2 bg-white/60 rounded-2xl m-3 backdrop-blur-sm">
        最低氣溫 <span class="text-yellow-800" id="daily_low">${data?.cwa_daily_low ?? "N/A"}°C</span>
      </p>
    </section>
    <section class="bg-gray-200/70 p-4 m-4 min-w-1/3 md:w-fit w-full mx-auto rounded-lg shadow-lg backdrop-blur-sm gap-2 m-3">
      <h3 class="text-3xl text-bold">本地</h3>
      <hr/>
      <p class="p-2 bg-white/60 rounded-2xl m-3 backdrop-blur-sm">氣溫: <span class="text-yellow-800" id="local_temp">${data?.local_temp ?? "N/A"}°C</span></p>
      <p class="p-2 bg-white/60 rounded-2xl m-3 backdrop-blur-sm">濕度: <span class="text-yellow-800" id="local_hum">${data?.local_hum ?? "N/A"}%</span></p>
      <p class="p-2 bg-white/60 rounded-2xl m-3 backdrop-blur-sm">
        蠕動馬達 <button onclick='fetchRemote()' class="p-2 bg-lime-400 hover:bg-lime-600 rounded-xl m-1 transition-all duration-100" id='jistatus2'>${data?.local_jistatus ? "關" : "開"}</button></p>
      <p class="p-2 bg-white/60 rounded-2xl m-3 backdrop-blur-sm">
        紅外線 <button onclick="fetchGFA()" class="p-2 bg-lime-400 hover:bg-lime-600 rounded-xl m-1 transition-all duration-100" id="light2">${gfa() ? "關" : "開"}</button>
      </p>
    </section>
    <section class="bg-gray-200/70 p-4 m-4 min-w-1/3 md:w-fit w-full mx-auto rounded-lg shadow-lg backdrop-blur-sm gap-2 m-3">
      <h3 class="text-3xl text-bold">GPS 定位</h3>
      <hr/>
      <p class="p-2 bg-white/60 rounded-2xl m-3 backdrop-blur-sm">經度: <span class="text-yellow-800" id="gps_lat">${data?.local_gps_lat || "N/A"}</span></p>
      <p class="p-2 bg-white/60 rounded-2xl m-3 backdrop-blur-sm">緯度: <span class="text-yellow-800" id="gps_long">${data?.local_gps_long || "N/A"}</span></p>
    </section>
    <section class="bg-gray-200/70 p-4 m-4 min-w-1/3 md:w-fit w-full mx-auto rounded-lg shadow-lg backdrop-blur-sm gap-2 m-3">
      <ul id="detected_list">
        <!--${getList}-->
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
    let lightStatus = document.getElementById("light").innerText;
    let gpsLat = document.getElementById("gps_lat").innerText;
    let gpsLong = document.getElementById("gps_long").innerText;
    let detectedList = document.getElementById("detected_list").innerText;
    let lightStatus2 = document.getElementById("light2").innerText;
    let jistatus2 = document.getElementById("jistatus2").innerText;
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
    const socket = new WebSocket("wss://hpg7.sch2.top/logger/");
    socket.addEventListener("message", (event1) => {
      const event = JSON.parse(event1.data)[0]; // AI added this
      console.log(event);
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
      motorStatus = event.local_jistatus ? "關" : "運轉中";
      gpsLat = event.local_gps_lat;
      gpsLong = event.local_gps_long;
      detectedList = event.local_detect;
      lightStatus = event.local_light ? "關" : "開";
      lightStatus2 = event.local_light ? "關" : "開";
      jistatus2 = event.local_jistatus ? "關" : "開";
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
      console.log(lightStatus);
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
