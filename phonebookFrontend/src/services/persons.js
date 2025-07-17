import axios from 'axios';
const baseUrl = 'http://localhost:3001/api/persons'

function responseData(response) {
  return response.data;
}

function getAll() {
  let response = axios.get(baseUrl)
  return response.then(responseData) 
}

function create(newPerson) {
  let response = axios.post(baseUrl, newPerson);
  return response.then(responseData);
}

function deletePerson(id) {
  let response = axios.delete(`${baseUrl}/${id}`);
  return response.then(responseData);
}

function updateNumber(id, newPerson) {
  let response = axios.put(`${baseUrl}/${id}`, newPerson);
  return response.then(responseData);
}

export default { getAll, create, deletePerson, updateNumber }