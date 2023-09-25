import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.js";
import { schemaAlugueis } from "../schemas/alugueis.schemas.js";
import { deletaAluguel, inserirAlugueis } from "../controllers/alugueis.controller.js";

const alugueisRouter = Router()

alugueisRouter.post("/rentals", validateSchema(schemaAlugueis), inserirAlugueis)
alugueisRouter.delete("/rentals", deletaAluguel)

export default alugueisRouter;