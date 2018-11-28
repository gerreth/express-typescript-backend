import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
// clients
import initSpotifyService from "./clients/spotify";
// controllers
import bandsController from "./controllers/BandsController";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.get("/", (request: Request, response: Response) => {
  response.send({ message: "Hello from home!" });
});

app.get("/bands/top/:user", initSpotifyService, bandsController.top);
app.post("/bands/similar", initSpotifyService, bandsController.similar);

// catch 404 and forward to error handler
app.use((request: Request, response: Response, next: NextFunction) => {
  response.status(400).send({ error: "Not found! (404)" });
});

export default app;
