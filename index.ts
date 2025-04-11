import { sql } from "bun";
import index from "./index.html";
import errorpage from "./errorpage.html";


async function saveInfo(
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
    
}

Bun.serve({
    port: 3000,
    routes: {
        "/logger/": index,
        "/logger/view": index,
        "/**": errorpage
    }
})