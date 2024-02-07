const knex = require("../database/knex");
const DiskStorage = require("../providers/diskStorage");
const AppError = require("../utils/AppError");

class UserAvatarController {
  async update(req, res) {
    const user_id = req.user.id;
    const avatarFileName = req.file.filename; //(property) Express.Multer.File.filename: string

    const diskStorage = new DiskStorage();

    const user = await knex("users").where({ id: user_id }).first();

    if (!user) {
      throw new AppError(
        "Somente usuários autenticados podem mudar o avatar.",
        401
      ); //testa autenticação do usuário.
    }

    if (user.avatar) {
      await diskStorage.deleteFile(user.avatar); // deleta a imagem atualmente utilizada como avatar.
    }

    const fileName = await diskStorage.saveFile(avatarFileName);
    user.avatar = fileName;

    await knex("users").update(user).where({ id: user_id });

    return res.json(user);
  }
}

module.exports = UserAvatarController;