const express = require('express');
const morgan = require('morgan');

const app = express();

const cors = require('cors')
app.use(express.static('dist'))
app.use(cors());
app.use(express.json());

morgan.token('postbody', function(request, response) {
  if (request.method !== "POST") {
    return '';
  }

  return JSON.stringify(request.body);
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postbody'));

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
  response.json(persons);
})

app.get('/api/persons/:id', (request, response) => {
  let person = persons.find(person => person.id === request.params.id);
  if (person) {
    response.json(person);
  } else {
    response.set()
    response.status(404).end()
  }
}) 

app.get('/info', (request, response) => {
  let data = `<p>Phonebook has info for ${persons.length} people </p>`;
  data += `<p>${new Date()}</p>`
  response.send(data);
})

app.delete('/api/persons/:id', (request, response) => {
  let idPresent = persons.map(person => person.id).includes(request.params.id);
  if (idPresent) {
    persons = persons.filter(person => person.id !== request.params.id);
    response.status(204).end();
  } else {
    response.status(404).end();
  }
})

function new_person_error(data) {
  if (data.name === undefined) {
    return 'new entry must have a name'
  } else if (data.number === undefined) {
    return 'new entry must have a number'
  } else if (persons.map(person => person.name).includes(data.name)) {
    return 'name must be unique'
  } else {
    return null;
  }
}

app.post('/api/persons', (request, response) => {
  let error = new_person_error(request.body);
  if (error === null) {
    let newId = String(Math.floor(Math.random() * 10000));
    const person = { ...request.body, id: newId };
    persons.push(person);
    response.json(person);
  } else {
    response.status(400).json({ error })
  }
  
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})