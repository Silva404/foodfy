const User = require("../models/User");
const mailer = require("../../lib/mailer");

module.exports = {
  async profile(req, res) {
    const user = await User.findUser(req.session.userId);

    return res.render("admin/users/user", { user });
  },
  async list(req, res) {
    const users = await User.all();

    let erro = "";
    if (req.session.error) {
      erro = req.session.error;
    }

    return res.render("admin/users/users", { users, erro });
  },
  create(req, res) {
    return res.render("admin/users/register");
  },
  async post(req, res) {
    try {
      const userId = await User.create(req.body);
      const user = await User.findUser(userId.id);
      
      req.session.userId = userId;

      await mailer.sendMail({
        to: user.email,
        from: "foodfy-admin@mail.com",
        subject: "Seja bem vindo ao Foodfy",
        html: `
        <h2>Seja bem-vindo!</h2>
        <p>Aqui está sua informação de acesso, seu email e senha gerados pelo sistema e são temporários, você pode alterá-los em seu perfil.</p> 
        <h5>Email:</h5>
        ${user.email}
        <h5>Senha:</h5>
        ${user.password}
        <p><a href="http://localhost:3000/admin/users/login" target="_blank">
        FAÇA JÁ SEU LOGIN
        </a></p>
        `,
      });
    } catch (err) {
      console.error(err);
    }

    return res.redirect("/admin/users");
  },
  async show(req, res) {
    let user = await User.findUser(req.params.id);

    return res.render("admin/users/editUser", { user });
  },
  async put(req, res) {
    try {
      const { id } = req.user;

      let { email, name } = req.body;

      await User.update(id, {
        name,
        email,
      });

      return res.render("admin/users/user", {
        user: req.body,
        success: "Usuário atualizado com sucesso",
      });
    } catch (err) {
      console.error(err);
      return res.render("admin/users/user", {
        error: "Algum erro aconteceu!",
      });
    }
  },
  async delete(req, res) {
    try {
      await User.delete(req.body.id);
    } catch (err) {
      console.error(err);
    }

      // if (!req.session.isAdmin) {
      //   req.session.destroy()

      //   return res.render('session/loginForm', {
      //     success: "Usuário Deletado com sucesso"
      //   })
      // } else {
      //   return res.render("admin/users/users", {
      //     success: "Usuário Deletado com sucesso"
      //   })
      // }

      return res.render("admin/users/users", {
        success: "Usuário Deletado com sucesso",
      });
    
  },
};
