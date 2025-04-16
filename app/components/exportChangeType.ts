import { sql } from "bun";
let global: boolean = false;
export async function exportChangeType() {
    const latestData = await sql`
        SELECT * FROM jistatus 
        ORDER BY id DESC 
        LIMIT 1
        `;    
    const getList = await sql`
    INSERT INTO jistatus(status)
    VALUES (${!latestData[0]?.status})
    `
    global = !latestData[0]?.status;
}

export function getJiStatus(): boolean {
    return global
}