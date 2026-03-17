import { get, post, put } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";

export interface Applicant {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: "REGISTERED" | "FORM_COMPLETED" | "INTERVIEW_SCHEDULED" | "INTERVIEWED" | "HIRED" | "REJECTED";
  experience: string | null;
  education: string | null;
  formData: any;
  notes: string | null;
  vacancyId: number;
  vacancy?: any;
  interviews?: any[];
}

export const getApplicants = async (vacancyId?: number): Promise<TResult<Applicant[]>> => {
  const query = vacancyId ? `?vacancyId=${vacancyId}` : "";
  return await get<Applicant[]>(`/applicants${query}`);
};

export const updateApplicantStatus = async (id: number, status: string, notes?: string): Promise<TResult<Applicant>> => {
  return await put<Applicant>(`/applicants/${id}`, { status, notes });
};

export const applyPublic = async (qrToken: string, data: any): Promise<TResult<any>> => {
    return await post<any>(`/applicants/apply/${qrToken}`, data);
};
