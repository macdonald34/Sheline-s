const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function call(path, opts = {}){
  const res = await fetch(`${API}${path}`, {
    headers: {'Content-Type':'application/json'},
    ...opts
  })
  return res.json()
}

export function signup(data){
  return call('/api/auth/signup', {method:'POST', body: JSON.stringify(data)})
}

export function login(data){
  return call('/api/auth/login', {method:'POST', body: JSON.stringify(data)})
}

export function listEvents(page=1){
  return call(`/api/events?page=${page}`)
}

export function createBooking(data, apiKey){
  return fetch(`${API}/api/bookings`, {
    method: 'POST',
    headers: {'Content-Type':'application/json', 'X-API-KEY': apiKey},
    body: JSON.stringify(data)
  }).then(r=>r.json())
}

export default {signup, login, listEvents, createBooking}
