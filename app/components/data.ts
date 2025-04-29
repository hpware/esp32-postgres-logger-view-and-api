import { randomUUIDv7, sql } from "bun";

export default async function datats(local_detect_2: string) {
  if (local_detect_2) {
    const uuid = randomUUIDv7();
    try {
      const save2 = await sql`
        insert into detect (
            item
            created_at
            detected_at
            imageURL
        )
        VALUES (
            ${local_detect_2},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            "https://mini-s3.sch2.top/images/${uuid}.png"
        )
        `;
      console.log(save2);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
