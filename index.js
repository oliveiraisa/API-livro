const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(bodyParser.json());

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'  // Caminho para o arquivo do banco de dados
});

const livro = sequelize.define('livro', {
    autor: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    genero: { type: DataTypes.STRING, allowNull: false },
    titulo: { type: DataTypes.STRING, allowNull: false },
    ano: { type: DataTypes.INTEGER, allowNull: false }
});

(async () => {
    await sequelize.sync({ force: true });
    console.log("titulo sincronizados com o banco de dados.");
})();

app.get('/livros', async (req, res) => {
    const livros = await livro.findAll();
    res.json(livros);
});

app.get('/livros/:autor', async (req, res) => {
    const { autor } = req.params;
    const livro = await livro.findOne({ where: { autor } });
    if (livro) {
        res.json(livro);
    } else {
        res.status(404).json({ message: 'livro não encontrado.' });
    }
});

app.post('/livros', async (req, res) => {
    const { autor, genero, titulo, ano } = req.body;
    try {
        const livro = await livro.create({ autor, genero, titulo, ano });
        res.status(201).json({ message: 'livro cadastrado com sucesso.', livro });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/livros/:autor', async (req, res) => {
    const { autor } = req.params;
    const { genero, titulo, ano } = req.body;
    try {
        const [updated] = await livro.update({ genero, titulo, ano }, { where: { autor } });
        if (updated) {
            const updatedlivro = await livro.findOne({ where: { autor } });
            res.json({ message: 'Informações do livro atualizadas com sucesso.', livro: updatedlivro });
        } else {
            res.status(404).json({ message: 'livro não encontrado.' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/livros/:autor', async (req, res) => {
    const { autor } = req.params;
    try {
        const deleted = await livro.destroy({ where: { autor } });
        if (deleted) {
            res.json({ message: 'livro excluído com sucesso.' });
        } else {
            res.status(404).json({ message: 'livro não encontrado.' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});