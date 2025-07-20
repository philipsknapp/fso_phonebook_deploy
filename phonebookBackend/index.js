require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person');

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

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(result => response.json(result))
  
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(result => {
      response.json(result);
    })
    .catch(error => next(error));
}) 

app.get('/info', (request, response) => {
  Person.find({})
    .then(result => {
      let totalPeople = result.length;
      let data = `<p>Phonebook has info for ${totalPeople} people </p>`;
      data += `<p>${new Date()}</p>`
      response.send(data);
    })
  
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
})

function new_person_error(data) {
  console.log("testing new person data, number is: ", typeof data.number)
  if (data.name === undefined || data.name === "") {
    return 'new entry must have a name'
  } else if (data.number === undefined || data.number === "") {
    return 'new entry must have a number'
  // } else if (persons.map(person => person.name).includes(data.name)) {
  //   return 'name must be unique'
  // } 
  } else {
    return null;
  }
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  let error = new_person_error(body);
  
  if (error) {
    return response.status(400).json({ error })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson);
  }).catch(error => next(error));
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  
  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name;
      person.number = number;

      return person.save().then(updatedPerson => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id'})
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message });
  }

  next(error)
}

app.use(errorHandler);

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})