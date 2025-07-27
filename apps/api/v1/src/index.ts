import express from "express";
import cors from "cors";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", require("./routes"));
app.use("/api/v1/auth", require("./routes/auth"));


app.get("/", (req, res) => {
  res.send("cex is up and running");
});