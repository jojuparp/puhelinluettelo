const mongoose = require('mongoose')

function error() {
  console.log('give password as first argument, name and number as second and third!')
  process.exit(1)
}

if ( process.argv.length<3 || process.argv.length > 5 ) {
   error()
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://fullstack:${password}@cluster0-t427h.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

function addNew() {
    const person = new Person({
        name: name,
        number: number
    })
      
    person.save().then(response => {
    console.log(`Added ${person.name} number ${person.number} to phonebook`);
    mongoose.connection.close();
    })
}

function printAll() {
    
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
          console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
      })
}

switch (process.argv.length) {
    case 5: addNew()
    break
    case 3: printAll()
    break
    case 4: error()
    break
}