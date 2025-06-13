import css from './App.module.css';
import NoteList from '../NoteList/NoteList';
import NoteModal from '../NoteModal/NoteModal';


export default function App() {
    return (
       <div className={css.app}>
	<header className={css.toolbar}>
		{/* Компонент SearchBox */}
		{/* Пагінація */}
        <button className={css.button}>Create note +</button>
            </header>
            <NoteList />
            <NoteModal />
</div>
 
    )
}