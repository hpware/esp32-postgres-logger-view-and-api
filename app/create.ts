import { sql } from "bun";

const create1 = await sql`
CREATE TABLE IF NOT EXISTS logger (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    cwa_type VARCHAR(50),
    cwa_location VARCHAR(100),
    cwa_temp DECIMAL(5,2),
    cwa_hum DECIMAL(5,2),
    cwa_daily_high DECIMAL(5,2),
    cwa_daily_low DECIMAL(5,2),
    local_temp DECIMAL(5,2),
    local_hum DECIMAL(5,2),
    local_gps_lat VARCHAR(20),
    local_gps_long VARCHAR(20),
    local_time TIMESTAMPTZ,
    local_jistatus BOOLEAN,
    local_detect JSONB
);
`;

console.log("Database schema created successfully");