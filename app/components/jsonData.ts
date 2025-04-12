import { sql } from "bun"; 

export async function jsonData() {

    const latestData = await sql`
    SELECT * FROM logger 
    ORDER BY id DESC 
    LIMIT 1
`;

    const data = latestData[0]
    const detectedItems = JSON.parse(data?.local_detect || '[]');
    return {
        data: data,
        detectedItems: detectedItems
    }
}