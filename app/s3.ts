import { S3Client } from "bun";

const minio = new S3Client({
  accessKeyId: process.env.MINIO_ACCESS_KEY,
  secretAccessKey: process.env.MINIO_SECRET_KEY,
  bucket: "logger-detect-30",
  region: "tw-home-1",
  endpoint: process.env.MINIO_URL,
});

export default minio;