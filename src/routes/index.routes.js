import { Router } from "express";
import gamesRouter from "./games.routes";
import clientsRouter from "./clientes.routes";
import alugueisRouter from "./alugueis.routes";

const router = Router();
router.use(gamesRouter)
router.use(clientsRouter)
router.use(alugueisRouter)

export default router;