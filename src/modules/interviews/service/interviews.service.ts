import { get, post, put } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";

export interface Interview {
  id: number;
  scheduledAt: string;
  notes: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  vacancyId: number;
  applicantId: number;
  interviewerId: number | null;
  vacancy?: any;
  applicant?: any;
}

export const getInterviews = async (): Promise<TResult<Interview[]>> => {
  return await get<Interview[]>(`/interviews`);
};

export const createInterview = async (data: Partial<Interview>): Promise<TResult<Interview>> => {
  return await post<Interview>(`/interviews`, data);
};

export const updateInterview = async (id: number, data: Partial<Interview>): Promise<TResult<Interview>> => {
  return await put<Interview>(`/interviews/${id}`, data);
};
