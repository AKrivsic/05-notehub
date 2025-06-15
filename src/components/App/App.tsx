import { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotes,
  createNote,
  deleteNote,
} from '../../services/noteService';
import { Toaster } from 'react-hot-toast';
import type { CreateNoteParams, FetchNotesResponse } from '../../services/noteService';
import NoteList from '../NoteList/NoteList';
import Pagination from '../Pagination/Pagination';
import SearchBox from '../SearchBox/SearchBox';
import NoteModal from '../NoteModal/NoteModal';
import NoteForm from '../NoteForm/NoteForm';
import css from './App.module.css';
import toast from 'react-hot-toast';

const PER_PAGE = 12;

function App() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError } = useQuery<FetchNotesResponse>({
  queryKey: ['notes', page, debouncedSearch],
    queryFn: () => {
    const params: {
      page: number;
      perPage: number;
      search?: string;
    } = {
      page,
      perPage: PER_PAGE,
    };
    if (debouncedSearch.trim() !== '') {
      params.search = debouncedSearch;
    }
    return fetchNotes(params);
  },
  placeholderData: (previousData) => previousData,
  });
  
  useEffect(() => {
  if (isError) {
    toast.error('Unable to connect');
  }
}, [isError]);

  useEffect(() => {
    if (data && data.notes.length === 0) {
      toast.error('No notes found for your request.');
    }
  }, [data, debouncedSearch]);

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsModalOpen(false);
      toast.success('Note created successfully!');
    },
    onError: () => {
      toast.error('Failed to create note');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted');
    },
    onError: () => {
      toast.error('Failed to delete note');
    },
  });

  const handleCreateNote = (values: CreateNoteParams) => {
    createNoteMutation.mutate(values);
  };

  const handleDeleteNote = (id: string) => {
    deleteNoteMutation.mutate(id);
  };

  const totalPages = data?.totalPages || 1;

  return (
    <div className={css.app}>
      <Toaster position="top-center" />
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={e => setSearch(e.target.value)} />
        {totalPages > 1 && (
          <Pagination pageCount={totalPages} onPageChange={({ selected }) => setPage(selected + 1)} />
        )}
        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      {!isLoading && !isError && data && data.notes.length > 0 && (
        <NoteList notes={data.notes} onDelete={handleDeleteNote} />
      )}

      {isModalOpen && (
        <NoteModal onClose={() => setIsModalOpen(false)}>
          <NoteForm onSubmit={handleCreateNote} onCancel={() => setIsModalOpen(false)} />
        </NoteModal>
      )}
    </div>
  );
}

export default App;
