import { format } from "date-fns";
import db from "../database/database.connection.js";
import { stripHtml } from "string-strip-html";

export async function listarClientes (req, res) {

    const { cpf } = req.query

    try {
        let listClients;
        if (cpf) {
            listClients = await db.query('SELECT * FROM customers WHERE cpf ILIKE $1;', [`%${cpf}%`])
        } else {
            listClients = await db.query('SELECT * FROM customers;')
        }

        const formatedClients = listClients.rows.map(client => ({
            ...client,
            birthday: format(new Date(client.birthday), 'yyyy-MM-dd')
        }));

        res.send(formatedClients)

    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function clientesPorID(req,res){

    const { id } = req.params

    try {
        const client = await db.query('SELECT * FROM customers WHERE id = $1;', [id])
        if (client.rows.length === 0) {
            return res.status(404).send({message: "Cliente não encontrado pelo id", id})
        }

        const formatedClient = {
            ...client.rows[0],
            birthday: format(new Date(client.rows[0].birthday), 'yyyy-MM-dd')
        };

        res.send(formatedClient)

    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export async function inserirClientes(req, res) {
    const { name, phone, cpf, birthday } = req.body
    const sanitizedName = stripHtml(name).result.trim()
    const sanitizedPhone = stripHtml(phone).result.trim()
    const sanitizedCpf = stripHtml(cpf).result.trim()
    const sanitizedBirthday = stripHtml(birthday).result.trim()

    try {
        const repeatCPF = await db.query('SELECT * FROM customers WHERE cpf = $1;', [sanitizedCpf])

        if (repeatCPF.rows.length > 0) {
            return res.status(409).send("Cliente já existente no Banco de Dados!")
        }

        await db.query('INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);', [sanitizedName, sanitizedPhone, sanitizedCpf, sanitizedBirthday])

        res.sendStatus(201);
        
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function editaClientes (req, res) {

    const { id } = req.params
	const { name, phone, cpf, birthday } = req.body
    const sanitizedName = stripHtml(name).result.trim()
    const sanitizedPhone = stripHtml(phone).result.trim()
    const sanitizedCpf = stripHtml(cpf).result.trim()
    const sanitizedBirthday = stripHtml(birthday).result.trim()

	try {

        const repeatCPF = await db.query('SELECT * FROM customers WHERE cpf = $1 AND id != $2;', [sanitizedCpf, id])

        if (repeatCPF.rows.length > 0) {
            return res.status(409).send("Cliente já existente no Banco de Dados!")
        }

        await db.query('UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;',[sanitizedName, sanitizedPhone, sanitizedCpf, sanitizedBirthday, id])

		res.send("Cliente atualizado com sucesso!")

	} catch (err) {
		res.status(500).send(err.message)
	}
}