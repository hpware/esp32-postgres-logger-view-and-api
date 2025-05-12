import { randomUUIDv7, sql, s3, write, S3Client } from "bun";

import s3file from "../s3";

export async function fcjaauwi(detect: string, body: any) {
  try {
    const d7 = new Date().toUTCString();
    const uuid = randomUUIDv7();
    const fileName = `/${uuid}.jpg`;
    const s3filefile = s3file.file(fileName);
    await s3filefile.write(body, { type: body.type });
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