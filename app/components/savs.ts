import { randomUUIDv7, sql } from "bun";

let fcjaa = [];

export async function fcjaauwi(
    detect: string,
): Promise<boolean> {
    try {
        fcjaa.push({
            time: new Date().toUTCString(),
            item: detect,
        })
    } catch (error) {
        console.error("Error saving data:", error);
        return false;
    }
}

export function fcja() {
    return fcjaa;
}