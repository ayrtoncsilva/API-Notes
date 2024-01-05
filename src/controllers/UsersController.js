const {hash, compare} = require("bcryptjs")
const AppError = require("../utils/AppError");
const sqliteConnection = require("../database/sqlite")

class UsersController {

    // Controller para criação de usuarios
    async create(request, response) {
        const { name, email, password } = request.body;

        const database = await sqliteConnection()
        const usersCheckExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])

        if(usersCheckExists) {
            throw new AppError("Email já cadastrado!")
        }

        const hashedPassword = await hash(password, 8)

        await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
        [name, email, hashedPassword])

        return response.status(201).json()
    }

    // Controller para atualização de usuarios
    async update(request, response) {
        const { name, email, password, old_password } = request.body
        const { id } = request.params

        const database = await sqliteConnection()
        const user = await database.get("SELECT * FROM users WHERE id = (?)", [id])

        if(!user) {
            throw new AppError("Usuário não encontrado")
        }

        const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])

        if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError("Este e-mail já está em uso.")
        }

        user.name = name ?? user.name
        user.email= email ?? user.email

        if(password && !old_password) {
            throw  new AppError("Necessario informar senha antiga para executar a atualização para nova senha!")
        }

        if(password && old_password) {
            const checkPassword = await compare(old_password, user.password)

            if(!checkPassword){
                throw new AppError("A senha não confere")
            }

            user.password = await hash(password, 8)
        }

        await database.run(`
            UPDATE users SET
            name = ?,
            email = ?,
            password = ?,
            updated_at = DATETIME('now')
            WHERE id = ?`,
            [user.name, user.email, user.password, id])

        return response.json()
    }
}


module.exports = UsersController;