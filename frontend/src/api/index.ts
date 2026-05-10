import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

export const getPizze = () => api.get('/menu/pizze').then(res => res.data);
export const getAggiunte = () => api.get('/menu/aggiunte').then(res => res.data);
export const getOrdini = () => api.get('/ordini').then(res => res.data);
export const creaOrdine = (ordine: any) => api.post('/ordini', ordine).then(res => res.data);

export default api;
