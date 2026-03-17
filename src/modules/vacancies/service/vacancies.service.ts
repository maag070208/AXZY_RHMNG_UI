import { get, post, put, remove } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";

export interface VacancySlot {
  id: number;
  startTime: string;
  endTime: string;
  positions: number;
  _count?: {
    applicants: number;
  };
}

export interface Vacancy {
  id: number;
  title: string | null;
  description: string | null;
  department: string | null;
  salary: number | null;
  positions: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | "CANCELLED";
  qrToken?: string;
  startDate?: string;
  endDate?: string;
  workSchedule?: string;
  createdAt?: string;
  slots?: VacancySlot[];
  _count?: {
    applicants: number;
  };
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

export const getVacancyByToken = async (token: string): Promise<TResult<Vacancy>> => {
  return await get<Vacancy>(`/vacancies/public/${token}`);
};

export const getVacancyById = async (id: number): Promise<TResult<Vacancy>> => {
  return await get<Vacancy>(`/vacancies/${id}`);
};

export const deleteVacancy = async (id: number): Promise<TResult<void>> => {
  return await remove<void>(`/vacancies/${id}`);
};
