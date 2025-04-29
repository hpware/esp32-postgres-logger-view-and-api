import { randomUUIDv7, sql } from "bun";

let fcjaa = [];

export async function fcjaauwi(detect: string): Promise<boolean> {
  try {
    const d7 = new Date().toUTCString();
    const uuid = randomUUIDv7();
    const imgurl = `https://s3.yhw.tw/logger-detect-30/object-${uuid}.jpg`;
    const updateData = await sql`
        INSERT INTO detect (created_at, detected_at, item, imageurl)
        values (${d7}, ${d7}, ${detect}, ${imgurl} );
        `;
  } catch (e) {
    console.log(e);
  }
}

export async function fcja() {
  const updateData = await sql`
    SELECT * FROM detect 
    ORDER BY detected_at DESC
    `;
  console.log(updateData);
  return updateData;
}
/**
 *     try {
        fcjaa.push({
            time: new Date().toUTCString(),
            item: detect,
            imageURL: `https://s3.yhw.tw/logger-detect-30/${detect}.jpg`,
        })
    } catch (error) {
        console.error("Error saving data:", error);
        return false;
    }
 */
