import { format, differenceInDays } from 'date-fns';
import db from "../database/database.connection.js";
import { stripHtml } from "string-strip-html";

export async function inserirAlugueis(req, res) {
    const { customerId, gameId, daysRented } = req.body
    const sanitizedCustomerId = stripHtml(String(customerId)).result.trim();
    const sanitizedGameId = stripHtml(String(gameId)).result.trim();
    const sanitizedDaysRented = stripHtml(String(daysRented)).result.trim();


    try {

        const clientExist = await db.query('SELECT * FROM customers WHERE id = $1;', [sanitizedCustomerId]);
        const gameExist = await db.query('SELECT * FROM games WHERE id = $1;', [sanitizedGameId]);
        const result = await db.query(`SELECT COUNT(*) AS alugueis_em_aberto FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL;`, [sanitizedGameId]);
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

        const result = await db.query('SELECT FROM rentals WHERE id = $1;', [id])

        if (result.rowCount === 0) {
            return res.status(404).send("Esse aluguel não está no sistema!")
        }

        if (result.rows[0].returnDate === null || undefined) {
            return res.status(400).send({ message: "Aluguel não finalizado" })
        }

        await db.query('DELETE FROM rentals WHERE id = $1;', [id]) //deleting

        res.status(200).send("Produto deletado com sucesso!")

    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function listarAlugueis(req, res) {
    try {
        const listaAlugueis = await db.query(`SELECT 
        rentals.id, 
        rentals."customerId", 
        rentals."gameId", 
        rentals."rentDate",
        rentals."daysRented",
        rentals."returnDate",
        rentals."originalPrice",
        rentals."delayFee",
        customers.id AS "customer.id",
        customers.name AS "customer.name",
        games.id AS "game.id",
        games.name AS "game.name" FROM rentals 
        JOIN customers ON rentals."customerId" = customers.id
        JOIN games ON rentals."gameId" = games.id;
        `)

        const resultFormated = listaAlugueis.rows.map(item => ({
            id: item.id,
            customerId: item.customerId,
            gameId: item.gameId,
            rentDate: item.rentDate,
            daysRented: item.daysRented,
            returnDate: item.returnDate,
            originalPrice: item.originalPrice,
            delayFee: item.delayFee,
            customer: {
                id: item["customer.id"],
                name: item["customer.name"]
            },
            game: {
                id: item["game.id"],
                name: item["game.name"]
            }
        }))

        res.send(resultFormated)

    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function finalizarAlugueis(req, res) {
    const {id} = req.params

    try {
        const existentId = await db.query('SELECT FROM rentals WHERE id = $1;', [id])

        if (existentId.rowCount === 0) {
            return res.status(404).send("Aluguel não encontrado pelo id!")
        }
        if (existentId.rows[0].returnDate !== null) {
            return res.status(400).send({ message: "Aluguel já finalizado" })
        }

        const rentDate = new Date(existentId.rows[0].rentDate)
        const daysRented = existentId.rows[0].daysRented
        const today = new Date()

        const differenceInDays = differenceInDays(today, rentDate)

        const delay = Math.max(differenceInDays - daysRented, 0)
        const dialyPrice = existentId.rows[0].originalPrice/daysRented

        const ticket = delay * dialyPrice

        await db.query(`UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3;`, [today, ticket, id])
        
        res.status(200).send("Produto Entregue!")
    } catch (err) {
        res.status(500).send(err.message)
    }
}