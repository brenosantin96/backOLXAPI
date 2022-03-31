const bcrypt = require('bcrypt');
const { validationResult, matchedData } = require('express-validator') //usando validator no controller
    //depois de passar pelo middleware authValidator, pegamos as informacoes validadas e usamos no controller.
const User = require("../models/User")
const State = require('../models/State')


const mongoose = require('mongoose');


module.exports = {

    signin: async(req, res) => {


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() });
            return;
        }
        const data = matchedData(req);

        //validando o email
        const user = await User.findOne({ email: data.email });
        if (!user) {
            res.json({ error: 'Email e/ou senha errados.' });
            return;
        }

        //Validando a senha, vamos usar o crypt. temos a senha HASH e temos a senha que ele digitou pra acessar, tem q comparar as duas
        const match = await bcrypt.compare(data.password, user.passwordHash);
        if (!match) {
            res.json({ error: 'Email e/ou senha errados.' });
            return;
        }

        //Gerando um numero aleatorio pro token.
        const payload = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payload, 10);

        user.token = token;
        await user.save();

        res.json({ token, email: data.email });

    },

    signup: async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() });
            return;
        }
        const data = matchedData(req);
        //Validacao de erros acima. validacao de email e de estados abaixo.

        //Verificando se email ja existe
        const user = await User.findOne({
            email: data.email
        });
        if (user) {
            res.json({ error: { email: { msg: "Email já existe" } } });
            return;
        }

        //Verificando se estado existe
        if (mongoose.Types.ObjectId.isValid(data.state)) {

            const StateItem = await State.findById(data.state);
            if (!StateItem) {
                res.json({ error: { state: { msg: "Estado não existe" } } });
                return;
            }

        } else {
            res.json({ error: { state: { msg: "Código de estado inválido." } } });
            return;
        }

        //criar hash da senha, encriptando.
        const passwordHash = await bcrypt.hash(data.password, 10);

        //Gerando um numero aleatorio pro token.
        const payload = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payload, 10);

        const newUser = new User({
            name: data.name,
            email: data.email,
            passwordHash: passwordHash,
            token: token,
            state: data.state
        });

        await newUser.save();

        res.json({ token });

    }

};