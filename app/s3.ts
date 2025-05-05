import { S3Client } from "bun";

const minio = new S3Client({
  accessKeyId: process.env.MINIO_ACCESS_KEY,
  secretAccessKey: process.env.MINIO_SECRET_KEY,
  bucket: "h86735",

  // Make sure to use the correct endpoint URL
  // It might not be localhost in production!
  endpoint: "https://object-storage.sch2.top/",
});