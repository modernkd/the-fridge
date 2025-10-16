import { useState, useEffect } from 'react';
import styles from './StickyNotes.module.css';
import { supabase } from '../../lib/supabase';

interface Note {
  id: number;
  name: string;
  title: string;
  message: string;
  created_at: string;
}

interface StickyNotesProps {
  isDarkMode?: boolean;
}

export default function StickyNotes({ isDarkMode = false }: StickyNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch approved notes from Supabase
    const fetchNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('id, name, title, message, created_at')
          .eq('status', 'approved')
          .order('created_at');

        if (error) {
          console.error('Failed to fetch notes:', error);
        } else {
          setNotes(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      }
    };

    fetchNotes();
  }, []);

  const nextNote = () => {
    setCurrentIndex((prev) => (prev + 1) % notes.length);
  };

  const prevNote = () => {
    setCurrentIndex((prev) => (prev - 1 + notes.length) % notes.length);
  };

  if (notes.length === 0) {
    return null;
  }

  const currentNote = notes[currentIndex];

  return (
    <div className={`${styles.stickyNotesContainer} ${isDarkMode ? styles.dark : ''}`}>
      <div className={styles.stickyNote}>
        <div className={styles.noteHeader}>
          <h4 className={styles.noteTitle}>{currentNote.title}</h4>
          <span className={styles.noteAuthor}>by {currentNote.name}</span>
        </div>
        <div className={styles.noteMessage}>{currentNote.message}</div>
        <div className={styles.noteDate}>{new Date(currentNote.created_at).toLocaleDateString()}</div>
      </div>

      {notes.length > 1 && (
        <div className={styles.navigation}>
          <button onClick={prevNote} className={styles.navButton}>
            ‹
          </button>
          <span className={styles.noteCounter}>
            {currentIndex + 1} / {notes.length}
          </span>
          <button onClick={nextNote} className={styles.navButton}>
            ›
          </button>
        </div>
      )}
    </div>
  );
}
