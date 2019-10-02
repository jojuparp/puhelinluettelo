const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const app = express()
const Person = require('./models/person')
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(cors())
morgan.token('body', function (request, response) 
{ return JSON.stringify(request.body) })
app.use(
    morgan(
        `:method :url :status :res[content-length] :response-time ms :body` 
    ))

const requestLogger = (request, response, next) => {
    console.log('Method', request.method)
    console.log('Path', request.path)
    console.log('Body', request.body)
    console.log('----')
    next()
}
app.use(requestLogger)

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons.map(person => person.toJSON()))
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person.toJSON())
    })
})

app.get('/api/info', (request, response, next) => {

    Person.count({}, (error, count) => {
        response.send(
            `<div>
                <p>Phonebook has info for ${count} people</p>
                <p>${new Date()}</p>
            </div>`
        )
        .catch(error => next(error))
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    console.log(request.params.name)
    console.log(request.params.id)
    console.log(request.params.number)
    const person = {
        name: body.name,
        number: body.number
    }

Person.findByIdAndUpdate(request.params.id, person, {new: true})
  .then(updatedPerson => {
    response.json(updatedPerson.toJSON())
  })
  .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number
    })
    console.log(person)

    person.save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => 
    response.json(savedAndFormattedPerson)
    )
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError' && error.kind == 'ObjectId') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400)
        .json({ error: error.message })
      }
  
    next(error)
  }
  
  app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})