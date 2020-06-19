const express = require('express');
const cors = require('cors');
const { uuid, isUuid } = require('uuidv4');

const app = express();
app.use(cors())
app.use(express.json())

/*
* Tipos de parâmetros
Query params: Filtros e paginação
Route Params: Identificar recursos (Atualizar/deletar)
Request body: Conteúdo na hora de criar ou editar um recurso (json)
*/

/*
* Middleware: Interceptador de requisições que interrome totalmente a requisição ou altera dados da requisição
*/

const books = [];

function logRequests(request, response, next) {

    const { method, url } = request;
    const logLabel = `[${method.toUpperCase()}] ${url}`;
    console.time(logLabel);
    next(); //Próximo middleware
    console.timeEnd(logLabel);

}

function validateProjectId(request, response, next) {

    const { id } = request.params;

    if (!isUuid(id)) {
        return response.status(400).json({ error: 'Invalid project ID.'})
    }

    return next();

}

app.use(logRequests); //O middleware também pode ser aplicado apenas em uma rota específica
app.use('/books/:id', validateProjectId); //Passa o middleware em rotas específicas

app.get('/books', (request, response) => {

    const {author} = request.query;
    const results = author
        ? books.filter(book => book.author.includes(author)) 
        : books;

    return response.json(results)
});


app.post('/books', (request, response) => {
    const {name, author} = request.body;
    const book = {id: uuid(), name, author}

    books.push(book)

    return response.json(book)
});

app.put('/books/:id', (request, response) => {

    const {id} = request.params;
    const {name, author} = request.body;
    const bookIndex = books.findIndex(book => book.id === id); //findIndex encontra qual é a posição do objeto no vetor
    
    if (bookIndex < 0) {
        return response.status(400).json({error : 'Book not found'})
    }

    const book = {
        id,
        name,
        author
    };

    books[bookIndex] = book; //substitui o objeto na posição encontrada pelo novo objeto criado

    return response.json(book);
    
    
});

app.delete('/books/:id', (request, response) => {
    const { id } = request.params;
    const bookIndex = books.findIndex(book => book.id === id); //findIndex encontra qual é a posição do objeto no vetor
    
    if (bookIndex < 0) {
        return response.status(400).json({error : 'Book not found'})
    }

    books.splice(bookIndex, 1); //Remove a informação contida no indice 

    return response.status(204).json();
});



app.listen(3333, () => {
    console.log('✔ Back-end started!')
});