import express from "express";
import songsRouter from "./routes/songs.js";
import "dotenv/config.js";
const app = express();
const PORT = process.env.PORT || 8082;
app.use("/songs", songsRouter);
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map