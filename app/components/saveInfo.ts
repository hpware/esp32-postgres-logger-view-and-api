import { sql } from "bun";

export async function saveInfo(
    cwa_type: string,
    cwa_location: string,
    cwa_temp: number,
    cwa_hum: number,
    cwa_daliyHigh: number,
    cwa_daliyLow: number,
    local_temp: number,
    local_hum: number,
    local_gps_lat: string,
    local_gps_long: string,  
    local_time: string,
    local_jistatus: boolean,
    local_detect: Array<any>  
) {
    const save = await sql`
    INSERT INTO logger (
        timestamp,
        cwa_type,
        cwa_location,
        cwa_temp,
        cwa_hum,
        cwa_daily_high,
        cwa_daily_low,
        local_temp,
        local_hum,
        local_gps_lat,
        local_gps_long,
        local_time,
        local_jistatus,
        local_detect
    ) VALUES (
        datetime('now'),
        ${cwa_type},
        ${cwa_location},
        ${cwa_temp},
        ${cwa_hum},
        ${cwa_daliyHigh},
        ${cwa_daliyLow},
        ${local_temp},
        ${local_hum},
        ${local_gps_lat},
        ${local_gps_long},
        ${local_time},
        ${local_jistatus ? 1 : 0},
        ${JSON.stringify(local_detect)}
    )`
    return save;
}