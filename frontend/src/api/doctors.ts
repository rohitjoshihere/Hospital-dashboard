import client from './client';

export interface Doctor {
  id: string;
  name: string;
  email: string;
}

export const getDoctors = () =>
  client.get<Doctor[]>('/doctors').then((r) => r.data);

export const createDoctor = (data: { name: string; email: string; password: string }) =>
  client.post('/auth/register', { ...data, role: 'DOCTOR' }).then((r) => r.data);
