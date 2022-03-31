const express = require('express');
const router = express.Router();

const Auth = require('./middlewares/Auth');
const AuthValidator = require('./validators/authValidator');
const userValidator = require('./validators/userValidator');


const AuthController = require('./controllers/authController');
const UserController = require('./controllers/userController');
const AdsController = require('./controllers/AdsController');

router.get('/ping', (req, res) => {
    res.json({ pong: true })
});

//Listagem dos estados
router.get('/states', UserController.getStates);


//Processo de autenticacao, Login e Signup - Rotas USER
router.post('/user/signin', AuthValidator.signin, AuthController.signin);
router.post('/user/signup', AuthValidator.signup, AuthController.signup);

//pegar informacoes do usuario
router.get('/user/me', Auth.private, UserController.info);
router.put('/user/me', userValidator.editAction, Auth.private, UserController.editAction);

router.get('/categories', AdsController.getCategories);

router.post('/ad/add', Auth.private, AdsController.addAction);
router.get('/ad/list', AdsController.getList);
router.get('/ad/item', AdsController.getItem);
//Para editar quando tem que editar imagens, e aconselhavel usar o POST no lugar do PUT.
router.post('/ad/:id', Auth.private, AdsController.editAction);

module.exports = router;