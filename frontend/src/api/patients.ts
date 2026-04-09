import client from './client';

export interface MediaItem {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  thumbPath: string | null;
  uploadedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  dob: string | null;
  createdAt: string;
  assignedDoctorId: string;
  doctor: { name: string; email: string };
  tags: { tag: { id: string; name: string } }[];
  media?: MediaItem[];
}

export const createPatient = (data: {
  name: string;
  dob?: string;
  assignedDoctorId: string;
  tags: string[];
}) => client.post<Patient>('/patients', data).then((r) => r.data);

export const updatePatient = (
  id: string,
  data: { name?: string; dob?: string; assignedDoctorId?: string; tags?: string[] }
) => client.put<Patient>(`/patients/${id}`, data).then((r) => r.data);

export const deletePatient = (id: string) =>
  client.delete(`/patients/${id}`);
