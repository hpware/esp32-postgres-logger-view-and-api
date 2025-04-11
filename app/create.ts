import { sql } from "bun";

const create1 = await sql`
create table logger (
    id bigint primary key generated always as identity,
    cwa_type text not null,
    cwa_location text not null,
    cwa_temp text not null,
    cwa_hum text not null,
    cwa_daliyHigh text not null,
    cwa_daliyLow text not null,
    local_temp text not null,
    local_hum text not null,
    local_gps_lat text not null,
    local_gps_long text not null,
    local_time text not null,
    local_jistatus text not null,
    local_detect text not null
)
`

console.log(create1);