const State = require('../models/State');
const User = require('../models/User');
const Category = require('../models/Category');
const Ad = require('../models/Ad');

const bcrypt = require('bcrypt');
const { validationResult, matchedData } = require('express-validator'); //usando validator no controller
const mongoose = require('mongoose');

module.exports = {

    getStates: async(req, res) => {
        let states = await State.find();
        res.json({ states })
    },
    info: async(req, res) => {

        let token = req.query.token;

        const user = await User.findOne({ token });
        const state = await State.findById(user.state);

        const ads = await Ad.find({ idUser: user._id.toString() });

        let adList = [];

        for (let i in ads) {


            const cat = await Category.findById(ads[i].category);

            adList.push({
                id: ads[i]._id,
                status: ads[i].status,
                images: ads[i].images,
                dateCreated: ads[i].dateCreated,
                title: ads[i].title,
                price: ads[i].price,
                priceNegotiable: ads[i].priceNegotiable,
                description: ads[i].description,
                views: ads[i].views,
                category: cat.slug
            });
        }

        //Todo esse bloco acima pode ser substituido pela linha:
        //adList.push({ ...ads[i], category: cat.slug})
        //Usando operador rest/spread para pegar as informacoes

        res.json({
            name: user.name,
            email: user.email,
            state: state.name,
            ads: adList
        })
    },

    editAction: async(req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() });
            return;
        }
        const data = matchedData(req);


        //Primeiro achar o usuario e modificar informacao por informacao.

        let updates = {};

        if (data.name) {
            updates.name = data.name;
        };
        if (data.email) {
            const emailCheck = await User.findOne({ email: data.email });
            if (emailCheck) {
                res.json({ error: 'Email já existente' });
                return;
            }
            updates.email = data.email;
        };

        if (data.state) {
            if (mongoose.Types.ObjectId.isValid(data.state)) {
                const stateCheck = await State.findById(data.state);
                if (!stateCheck) {
                    res.json({ error: "Estado não existe." });
                    return;
                }
                updates.state = data.state;
            } else {
                res.json({ error: "Código de estado inválido." });
                return;
            }
        }

        if (data.password) {
            updates.passwordHash = await bcrypt.hash(data.password, 10)
        }




        await User.findOneAndUpdate({ token: data.token }, { $set: updates })

        const userModified = await User.findOne({ token: data.token });

        res.json({ msg: "Usuario modificado com sucesso", userModified });

        return;
    }

};