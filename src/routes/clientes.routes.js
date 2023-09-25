import { Router } from "express";
import { clientesPorID, editaClientes, inserirClientes, listarClientes } from "../controllers/clientes.controller.js";
import { schemaClientes } from "../schemas/clientes.schemas.js";
import { validateSchema } from "../middlewares/validateSchema.js";

const clientsRouter = Router()

clientsRouter.get("/customers", listarClientes)
clientsRouter.get("/customers/:id", clientesPorID)
clientsRouter.post("/customers", validateSchema(schemaClientes), inserirClientes)
clientsRouter.put("/customers/:id", validateSchema(schemaClientes), editaClientes)

export default clientsRouter;