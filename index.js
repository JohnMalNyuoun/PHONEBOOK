require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./Modules/persons')

const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('body', (req) => {
  if (req.method === 'POST') return JSON.stringify(req.body)
  return null
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (req, res) => {
  Person.find({}).then(persons => {
    res.send(`
      <h1>Phonebook Backend</h1>
      <p>Phonebook has info for ${persons.length} people</p>
      <ul>
        <li><a href="/api/persons">/api/persons</a></li>
        <li><a href="/info">/info</a></li>
      </ul>
    `)
  })
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).json({ error: 'person not found' })
      }
    })
    .catch(error => next(error))
})

app.get('/info', (req, res) => {
  Person.find({}).then(persons => {
    const time = new Date()
    res.send(`
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${time}</p>
    `)
  })
})

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body

  if (!name || !number) {
    return res.status(400).json({ error: 'name and number are required' })
  }

  const person = new Person({ name, number })

  person.save()
    .then(savedPerson => {
      res.status(201).json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      if (updatedPerson) {
        res.json(updatedPerson)
      } else {
        res.status(404).json({ error: 'person not found' })
      }
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})