import { Router } from "express";
import gamesRouter from "./games.routes.js";
import clientsRouter from "./clientes.routes.js";
import alugueisRouter from "./alugueis.routes.js";

const router = Router();
router.use(gamesRouter)
router.use(clientsRouter)
router.use(alugueisRouter)

export default router;