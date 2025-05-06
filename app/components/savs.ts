import { randomUUIDv7, sql, s3, write, S3Client } from "bun";

import s3file from "../s3";

export async function fcjaauwi(detect: string, body: any) {
  try {
    const uuid = randomUUIDv7();
    const fileName = `/${detect}-${uuid}.jpg`;
    const s3filefile = s3file.file(fileName);
    const presignedUrl = s3filefile.presign({
      type: body.type, // optional, only if you need to set content type
      method: "PUT"    // if you want an upload URL
    });
    console.log(presignedUrl);
    const d7 = new Date().toUTCString();
    const imgurl = `https://s3.yhw.tw/logger-detect-30/${fileName}`;
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
