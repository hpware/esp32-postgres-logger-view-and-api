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

export default async function exportNewVideoView(ipport: string) {

    const latestData = await sql`
    SELECT * FROM logger 
    ORDER BY id DESC 
    LIMIT 1
`;

    const data = latestData[0]
    const detectedItems = JSON.parse(data?.local_detect || '[]');
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
        <style>
        ${css}
        </style>
        <body>
            <section>
            <h3>Stream</h3>
              <img src="http://${ipport}/video_feed" alt="Video stream"></img>
            </section>
            <iframe src="/logger/view" 
        style="border-style: none; height: 1200px; max-width:1400px; width:100%; overflow: hidden"
        onload="resizeIframe(this)" />
        </body>
    </html>
    `
}