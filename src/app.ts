import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
// controllers
import bandsController from "./controllers/BandsController";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.get("/", async (request: Request, response: Response) => {
  response.send({ message: "Hello from home!" });
});

app.get("/bands/top/:user", bandsController.top);
app.post("/bands/similar", bandsController.similar);

// catch 404 and forward to error handler
app.use((request: Request, response: Response, next: NextFunction) => {
  response.status(400).send({ error: "Not found! (404)" });
});

export default app;
