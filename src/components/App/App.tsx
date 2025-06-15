import { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { fetchNotes } from '../../services/noteService';
import { Toaster } from 'react-hot-toast';
import type { FetchNotesResponse } from '../../services/noteService';
import NoteList from '../NoteList/NoteList';
import Pagination from '../Pagination/Pagination';
import SearchBox from '../SearchBox/SearchBox';
import NoteModal from '../NoteModal/NoteModal';
import css from './App.module.css';
import toast from 'react-hot-toast';

const PER_PAGE = 12;

function App() {

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

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
   };
  
  const handlePageChange = (selected: { selected: number }) => {
    setPage(selected.selected + 1);
  };

  const totalPages = data?.totalPages || 1;

  return (
    <div className={css.app}>
      <Toaster position="top-center" />
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />
        {totalPages > 1 && (
          <Pagination pageCount={totalPages} onPageChange={handlePageChange} />
        )}
        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      {!isLoading && !isError && data && data.notes.length > 0 && (
        <NoteList notes={data.notes} />
      )}

      {isModalOpen && (
  <NoteModal onClose={() => setIsModalOpen(false)} />
)}
    </div>
  );
}

export default App;
