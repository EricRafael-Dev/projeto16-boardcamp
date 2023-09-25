import { db } from "../database/database.connection.js";
import { stripHtml } from "string-strip-html";

export async function inserirAlugueis(req, res) {
    const { customerId, gameId, daysRented } = req.body
    const sanitizedCustomerId = stripHtml(String(customerId)).result.trim();
    const sanitizedGameId = stripHtml(String(gameId)).result.trim();
    const sanitizedDaysRented = stripHtml(String(daysRented)).result.trim();


    try {

        const clientExist = await db.query('SELECT * FROM customers WHERE id = $1', [sanitizedCustomerId]);
        const gameExist = await db.query('SELECT * FROM games WHERE id = $1', [sanitizedGameId]);
        const result = await db.query(`SELECT COUNT(*) AS alugueis_em_aberto FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL`, [sanitizedGameId]);
        const alugueisEmAberto = parseInt(result.rows[0].alugueis_em_aberto)
        const estoqueTotal = gameExist.rows[0].stockTotal
        const avaliableGames = estoqueTotal - alugueisEmAberto
        const rentDate = new Date().toISOString().slice(0, 10)
        const originalPrice = sanitizedDaysRented * gameExist.rows[0].pricePerDay;
        const insertRentalQuery = `
            INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
            VALUES ($1, $2, $3, $4, NULL, $5, NULL)
            RETURNING *;
        `;
        const values = [sanitizedCustomerId, sanitizedGameId, rentDate, sanitizedDaysRented, originalPrice];


        if (clientExist.rows.length === 0) {
            return res.status(400).send("Não consta no sistema o id do cliente!")
        }
        if (gameExist.rows.length === 0) {
            return res.status(400).send("Não consta no sistema o id do game!")
        }
        if (sanitizedDaysRented <= 0) {
            return res.status(400).status("Adicione uma quantidade de dias maior que 0!")
        }
        if (avaliableGames <= 0) {
            return res.status(400).status("Não há jogos disponíveis para alugar")
        }

        await db.query(insertRentalQuery, values);

        res.sendStatus(201);

    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function deletaAluguel(req, res) {
    const { id } = req.params

    try {

        const result = await db.query('DELETE FROM rentals WHERE id = $1', [id])

        if (result.rowCount === 0) {
            return res.status(404).send("Esse aluguel não está no sistema!")
        }

        res.status(200).send("Produto deletado com sucesso!")

    } catch (err) {
        res.status(500).send(err.message)
    }
}