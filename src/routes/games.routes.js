import { Router } from "express";
import { inserirGames, listarGames } from "../controllers/games.controller.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { schemaGames } from "../schemas/games.schemas.js";

const gamesRouter = Router()

gamesRouter.get("/games", listarGames)
gamesRouter.psot("/games", validateSchema(schemaGames), inserirGames)

export default gamesRouter;