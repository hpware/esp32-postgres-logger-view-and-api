import { sql } from "bun";

export async function jsonData() {
    try {
        const results = await sql`SELECT * FROM logger ORDER BY created_at DESC LIMIT 100`;
        return Array.isArray(results) ? results : [];
    } catch (error) {
        console.error("Error fetching JSON data:", error);
        return [];
    }
}