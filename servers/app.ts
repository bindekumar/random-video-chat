import express, { Express, Request, Response } from "express";
import cors from "cors";

const app: Express = express();

// Middleware
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("Express Server is Running");
});

export default app;