import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.js";
import { schemaAlugueis } from "../schemas/alugueis.schemas.js";
import { deletaAluguel, finalizarAlugueis, inserirAlugueis, listarAlugueis } from "../controllers/alugueis.controller.js";

const alugueisRouter = Router()

alugueisRouter.post("/rentals", validateSchema(schemaAlugueis), inserirAlugueis)
alugueisRouter.get("/rentals", listarAlugueis)
alugueisRouter.delete("/rentals/:id", deletaAluguel)
alugueisRouter.post("/rentals/:id/return", finalizarAlugueis)

export default alugueisRouter;