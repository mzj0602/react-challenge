const app = require("./app");
const cloudinary = require("cloudinary");

const PORT = process.env.PORT || 3099;

process.on("uncaughtException", (err) => {
  console.error("UncaughtException:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("UnhandledRejection:", err?.message || err);
});

if (process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

