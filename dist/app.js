import express from "express";
import songsRouter from "./routes/songs.js";
import "dotenv/config.js";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 8082;
app.use(cors());
app.use("/songs", songsRouter);
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map