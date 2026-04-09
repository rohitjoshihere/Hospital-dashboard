import client from './client';
export const getDoctors = () => client.get('/doctors').then((r) => r.data);
export const createDoctor = (data) => client.post('/auth/register', { ...data, role: 'DOCTOR' }).then((r) => r.data);
