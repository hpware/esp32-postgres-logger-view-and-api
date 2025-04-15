import { sql } from "bun";
export async function exportChangeType() {
    const getList = await sql`
    INSERT INTO jistatus(status)
    VALUES (true)
    `
}