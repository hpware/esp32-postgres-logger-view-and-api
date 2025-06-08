export default async function getDeviceData(authToken: string, deviceId: string) {
    try {
        const data = await sql`
        SELECT * FROM logger 
        WHERE auth_token = ${authToken} AND device_id = ${deviceId}
        ORDER BY id DESC 
        LIMIT 1
        `;
        
        if (data.length === 0) {
        return { error: "No data found for the given device." };
        }
        
        return data[0];
    } catch (error) {
        console.error("Error fetching device data:", error);
        return { error: "Failed to fetch device data." };
    }
}