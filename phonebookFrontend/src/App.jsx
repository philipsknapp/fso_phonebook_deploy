import { useState, useEffect } from 'react'
import personService from './services/persons'

const FlashMessage = ({message}) => {
  if (message === null) {
    return
  }

  return <p className='flash'>{message}</p>;
}

const ErrorMessage = ({message}) => {
  if (message === null) {
    return
  }

  return <p className='flash error'>{message}</p>;
}

const Filter = ({searchStr, search}) => {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
        filter by name 
        <input value={searchStr} onChange={search}/>
      </form>
  )
}

const AddForm = ({submitPerson, newName, changeName, newNumber, changeNumber}) => {
  return (
    <form onSubmit={submitPerson}>
        <div>
          name: <input value={newName} onChange={changeName}/>
        </div>
        <div>
          number: <input value={newNumber} onChange={changeNumber}/>
        </div>
        <div>
          <button type="submit" >add</button>
        </div>
      </form>
  )
}
const Persons = ({shownPersons, deletePerson}) => {
  return (
    <ul>
      {shownPersons.map(person => {
        return (
          <Person key={person.id} person={person} deletePerson={deletePerson}/>
        )
      })}
    </ul>
  )
}
const Person = ({person, deletePerson}) => {
  return (
    <li>
      {person.name} {person.number}
      <button onClick={() => deletePerson(person)}>delete</button>
    </li>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchStr, setSearchStr] = useState('')
  const [flashMessage, setFlashMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(allPersonData => {
        setPersons(allPersonData)
      })
  }, []);

  let searchPattern = new RegExp(searchStr, 'i');
  // console.log(searchPattern);
  
  let shownPersons = persons.filter(person => searchPattern.test(person.name));

  function changeName(e) {
    setNewName(e.target.value);
  }

  function changeNumber(e) {
    setNewNumber(e.target.value);
  }

  function submitPerson(e) {
    e.preventDefault();
    
    if (persons.map(person => person.name).includes(newName)) {
      let matchingPerson = persons.find(person => person.name === newName);
      if (matchingPerson.number === newNumber) {
        alert(`${newName} is already added to phonebook`);
      } else {
        let confirmMessage = `${newName} is already added to phonebook, replace the old number with a new one?`
        if (window.confirm(confirmMessage)) {
          let updatedPerson = {...matchingPerson, number: newNumber};
          console.log(updatedPerson);
          personService
            .updateNumber(updatedPerson.id, updatedPerson)
            .then(responsePerson => {
              setPersons(persons.map(person => person.id === responsePerson.id ? responsePerson : person));
              setNewName('');
              setNewNumber('');
              displayFlash(`Updated number for ${responsePerson.name}`);
            }).catch(() => {
              setPersons(persons.filter(person => person.id !== matchingPerson.id));
              displayError(`${matchingPerson.name} is not present on the server`)
            })
        }
      }
      
    } else {
      let newPerson = { name: newName, number: newNumber }; //, id: String(persons.length + 1) };
    
      personService
        .create(newPerson)
        .then(responseData => {
          setPersons(persons.concat(responseData))
          setNewName('');
          setNewNumber('');
          displayFlash(`Added ${responseData.name}`);
        }) 
    }

    
  }

  function deletePerson(person) {
    let id = person.id;

    if (window.confirm(`Delete ${person.name}?`)) {
      personService
      .deletePerson(id)
      .then(() => {
        setPersons(persons.filter(person => person.id !== id));
        displayFlash(`Deleted ${person.name}`);
      })
      .catch(() => {
        setPersons(persons.filter(person => person.id !== id));
        displayError(`${person.name} has already been deleted from server`)
      })
    }
  }

  function search(e) {
    setSearchStr(e.target.value);
  }

  function displayFlash(message) {
    setFlashMessage(message);
    setTimeout(() => setFlashMessage(null), 5000);
  }

  function displayError(message) {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <ErrorMessage message={errorMessage} />
      <FlashMessage message={flashMessage}/>
      <Filter searchStr={searchStr} search={search}/>
      <h2>Add New</h2>
      <AddForm
        submitPerson={submitPerson}
        newName={newName} 
        changeName={changeName}
        newNumber={newNumber}
        changeNumber={changeNumber}
      />
      <h2>Numbers</h2>
      <Persons shownPersons={shownPersons} deletePerson={deletePerson}/>
    </div>
  )
}

export default App