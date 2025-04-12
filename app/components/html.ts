export default function s() {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <title>View database info</title>
            <meta charset="UTF-8"/>
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="og:author:email" content="hw@yuanhau.com">
            <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <script src="../public/websocket.js"></script>
        <style>
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
        </style>
        <body>
            <h1>顯示資料</h1>
            <section>
                <h3>氣象局</h3>
                <p>天氣狀態: <span data-value="cwa_type">N/A</span></p>
                <p>氣溫: <span data-value="cwa_temp">N/A</span>°C</p>
                <p>濕度: <span data-value="cwa_hum">N/A</span>%</p>
                <p>最高氣溫: <span data-value="cwa_daily_high">N/A</span>°C</p>
                <p>最低氣溫: <span data-value="cwa_daily_low">N/A</span>°C</p>
            </section>
            <section>
                <h3>本地</h3>
                <p>氣溫: <span data-value="local_temp">N/A</span>°C</p>
                <p>濕度: <span data-value="local_hum">N/A</span>%</p>
                <p>蠕動馬達: <span data-value="local_jistatus">停止</span></p>
             </section>
            <section>
                <h3>GPS 定位</h3>
                <p>經度: <span data-value="local_gps_lat">N/A</span></p>
                <p>緯度: <span data-value="local_gps_long">N/A</span></p>
            </section>
            <section>
                <h3>偵測到的物件</h3>
                <ul id="detected-items-list">
                    <li>無物件</li>
                </ul>
            </section>
            
            <script src="/logger/public/websocket.js"></script>
            <script>
                // Initialize an array to store detected items
                let detectedItems = [];
                
                // Add connection status indicator
                const statusElement = document.createElement('div');
                statusElement.style.position = 'fixed';
                statusElement.style.bottom = '10px';
                statusElement.style.right = '10px';
                statusElement.style.padding = '5px 10px';
                statusElement.style.backgroundColor = '#f59e0b';
                statusElement.style.color = 'white';
                statusElement.style.borderRadius = '5px';
                statusElement.textContent = 'WebSocket: 連接中...';
                document.body.appendChild(statusElement);
                
                // Listen for WebSocket connection status
                document.addEventListener('ws-connected', function() {
                    statusElement.style.backgroundColor = '#22c55e';
                    statusElement.textContent = 'WebSocket: 已連接';
                });
                
                document.addEventListener('ws-disconnected', function() {
                    statusElement.style.backgroundColor = '#ef4444';
                    statusElement.textContent = 'WebSocket: 已斷開';
                });
                
                // Listen for the data-updated event from websocket.js
                document.addEventListener('data-updated', function(event) {
                    const data = event.detail;
                    console.log('Received updated data:', data);
                    
                    // Update all elements with data-value attributes
                    document.querySelectorAll('[data-value]').forEach(element => {
                        const key = element.dataset.value;
                        if (data[key] !== undefined) {
                            // Special handling for local_jistatus
                            if (key === 'local_jistatus') {
                                element.textContent = data[key] ? "運轉中" : "停止";
                            } else {
                                element.textContent = data[key];
                            }
                        }
                    });
                    
                    // Update detected items list if available
                    if (data.detectedItems && Array.isArray(data.detectedItems)) {
                        detectedItems = data.detectedItems;
                        const itemsList = document.getElementById('detected-items-list');
                        
                        if (detectedItems.length > 0) {
                            itemsList.innerHTML = detectedItems
                                .map(item => \`<li>物件: \${item}</li>\`)
                                .join('');
                        } else {
                            itemsList.innerHTML = '<li>無物件</li>';
                        }
                    }
                });
            </script>
        </body>
    </html>
`
}