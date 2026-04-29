const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

morgan.token('body', (req) => {
  if (req.method === 'POST') return JSON.stringify(req.body)
  return null
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let phonebook = [
  { id: 1, name: 'Arto Hellas', number: '040-123456' },
  { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: 3, name: 'Dan Abramov', number: '12-43-234345' }
]

const generateId = () =>
  phonebook.length > 0 ? Math.max(...phonebook.map(p => p.id)) + 1 : 1

app.get('/', (req, res) => {
  res.send(`
    <h1>Phonebook Backend</h1>
    <p>Phonebook has info for ${phonebook.length} people</p>
    <ul>
      <li><a href="/api/persons">/api/persons</a></li>
      <li><a href="/info">/info</a></li>
    </ul>
  `)
})

app.get('/api/persons', (req, res) => {
  res.json(phonebook)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = phonebook.find(p => p.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).json({ error: 'person not found' })
  }
})

app.get('/info', (req, res) => {
  const time = new Date()
  res.send(`
    <p>Phonebook has info for ${phonebook.length} people</p>
    <p>${time}</p>
  `)
})

app.post('/api/persons', (req, res) => {
  const { name, number } = req.body

  if (!name || !number) {
    return res.status(400).json({ error: 'name and number are required' })
  }

  const existing = phonebook.find(p => p.name === name)
  if (existing) {
    return res.status(400).json({ error: 'name must be unique' })
  }

  const newPerson = {
    id: generateId(),
    name,
    number
  }

  phonebook = phonebook.concat(newPerson)
  res.status(201).json(newPerson)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  phonebook = phonebook.filter(p => p.id !== id)
  res.status(204).end()
})

app.put('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const { number } = req.body

  const index = phonebook.findIndex(p => p.id === id)
  if (index === -1) {
    return res.status(404).json({ error: 'person not found' })
  }

  phonebook[index] = { ...phonebook[index], number }
  res.json(phonebook[index])
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})