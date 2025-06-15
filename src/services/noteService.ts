import axios from 'axios';
import type { Note } from '../types/note';

const BASE_URL = 'https://notehub-public.goit.study/api/notes';

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_NOTEHUB_TOKEN}`,
  },
});

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
  currentPage: number;
}

export const fetchNotes = async (
  params: FetchNotesParams
): Promise<FetchNotesResponse> => {
  const cleanedParams = {
    ...params,
    ...(params.search?.trim() === '' && { search: undefined }),
  };

  const { data } = await instance.get<FetchNotesResponse>('', { params: cleanedParams });
  return data;
};

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: 'Todo' | 'Work' | 'Personal' | 'Meeting' | 'Shopping';
}

export const createNote = async (note: CreateNoteParams): Promise<Note> => {
  const { data } = await instance.post<Note>('', note);
  return data;
};

export const deleteNote = async (id: number): Promise<Note> => {
  const { data } = await instance.delete<Note>(`/${id}`);
  return data;
};