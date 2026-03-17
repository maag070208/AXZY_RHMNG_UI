import { get, post, put } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";

export interface Vacancy {
  id: number;
  title: string;
  description: string | null;
  department: string | null;
  salary: number | null;
  positions: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | "CANCELLED";
  qrToken?: string;
  createdAt?: string;
}

export const getVacancies = async (status?: string): Promise<TResult<Vacancy[]>> => {
  const query = status ? `?status=${status}` : "";
  return await get<Vacancy[]>(`/vacancies${query}`);
};

export const createVacancy = async (data: Partial<Vacancy>): Promise<TResult<Vacancy>> => {
  return await post<Vacancy>(`/vacancies`, data);
};

export const updateVacancy = async (id: number, data: Partial<Vacancy>): Promise<TResult<Vacancy>> => {
  return await put<Vacancy>(`/vacancies/${id}`, data);
};
