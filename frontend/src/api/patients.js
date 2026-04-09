import client from './client';
export const createPatient = (data) => client.post('/patients', data).then((r) => r.data);
export const updatePatient = (id, data) => client.put(`/patients/${id}`, data).then((r) => r.data);
export const deletePatient = (id) => client.delete(`/patients/${id}`);
