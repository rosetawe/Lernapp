import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

type Flashcard = {
  question: string;
  answer: string;
  category: string;
  subtitle?: string;
  code?: string;
  rating?: 'good' | 'medium' | 'bad';
};

type Note = {
  id: string;
  text: string;
};

function App() {
  // Notizen-States
  const [noteInput, setNoteInput] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNotesList, setShowNotesList] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Karteikarten-States
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [code, setCode] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Laden der Daten aus localStorage
  useEffect(() => {
    const storedNotes = localStorage.getItem('notes');
    if (storedNotes) setNotes(JSON.parse(storedNotes));

    const storedCards = localStorage.getItem('flashcards');
    if (storedCards) setFlashcards(JSON.parse(storedCards));
  }, []);

  // Notizen speichern
  const saveNotesToStorage = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  // Karteikarten speichern
  const saveFlashcardsToStorage = (updatedCards: Flashcard[]) => {
    setFlashcards(updatedCards);
    localStorage.setItem('flashcards', JSON.stringify(updatedCards));
  };

  // Neue Notiz hinzufügen oder bearbeiten
  const handleSaveNote = () => {
    if (!noteInput.trim()) return;

    if (editingNoteId) {
      const updatedNotes = notes.map((n) =>
        n.id === editingNoteId ? { ...n, text: noteInput } : n
      );
      saveNotesToStorage(updatedNotes);
      setEditingNoteId(null);
    } else {
      const newNote: Note = {
        id: crypto.randomUUID(),
        text: noteInput,
      };
      saveNotesToStorage([...notes, newNote]);
    }
    setNoteInput('');
  };

  // Notiz löschen
  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((n) => n.id !== id);
    saveNotesToStorage(updatedNotes);
  };

  // Notiz bearbeiten
  const handleEditNote = (id: string) => {
    const noteToEdit = notes.find((n) => n.id === id);
    if (noteToEdit) {
      setNoteInput(noteToEdit.text);
      setEditingNoteId(id);
      setShowNotesList(false);
    }
  };

  // Karteikarte hinzufügen
  const handleAddCard = () => {
    if (question.trim() && answer.trim() && category.trim()) {
      const newCard: Flashcard = {
        question,
        answer,
        category,
        subtitle,
        code,
        rating: 'medium',
      };
      const updatedCards = [...flashcards, newCard];
      saveFlashcardsToStorage(updatedCards);
      setQuestion('');
      setAnswer('');
      setCategory('');
      setSubtitle('');
      setCode('');
    }
  };

  // Aktuelle Karte
  const currentCard = flashcards[currentIndex];

  // Karte bewerten
  const rateCard = (rating: 'good' | 'medium' | 'bad') => {
    const updatedCards = [...flashcards];
    updatedCards[currentIndex].rating = rating;
    saveFlashcardsToStorage(updatedCards);
    showWeightedNextCard(updatedCards);
  };

  // Nächste Karte basierend auf Gewichtung anzeigen
  const showWeightedNextCard = (cards: Flashcard[]) => {
    const weightedList: number[] = [];

    cards.forEach((_, i) => {
      const rating = cards[i].rating || 'medium';
      const weight = rating === 'good' ? 1 : rating === 'medium' ? 3 : 5;
      for (let j = 0; j < weight; j++) {
        weightedList.push(i);
      }
    });

    if (weightedList.length === 0) return;

    let randomIndex = currentIndex;
    while (randomIndex === currentIndex && weightedList.length > 1) {
      randomIndex = weightedList[Math.floor(Math.random() * weightedList.length)];
    }

    setCurrentIndex(randomIndex);
    setShowAnswer(false);
  };

  return (
    <div>
      <h1>Mein Lerntool</h1>

      {/* Notizbereich */}
      <section className="note-section">
        <h2>Tagesnotiz</h2>
        <textarea
          placeholder="Was ist dein Ziel für heute?"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          rows={4}
          className="note-input"
        />
        <div className="flex" style={{ marginTop: '0.5rem' }}>
          <button onClick={handleSaveNote}>
            {editingNoteId ? 'Notiz speichern' : 'Neue Notiz hinzufügen'}
          </button>
          <button
            onClick={() => setShowNotesList(!showNotesList)}
            style={{ marginLeft: 'auto' }}
          >
            {showNotesList ? 'Notizen verbergen' : `Alle Notizen (${notes.length})`}
          </button>
        </div>

        {/* Liste aller Notizen mit Animation */}
        <AnimatePresence>
          {showNotesList && (
            <motion.div
              key="notes-list"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginTop: '1rem' }}
            >
              {notes.length === 0 && <p>Keine Notizen vorhanden.</p>}
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  className="note-preview"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.8rem',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  layout
                >
                  <p style={{ margin: 0, flex: 1 }}>{note.text}</p>
                  <div style={{ marginLeft: '1rem' }}>
                    <button
                      onClick={() => handleEditNote(note.id)}
                      style={{ marginRight: '0.5rem', backgroundColor: '#f39c12', color: 'black' }}
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      style={{ backgroundColor: '#e74c3c' }}
                    >
                      Löschen
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <hr />

      {/* Neue Karteikarte erstellen */}
      <section>
        <h2>Neue Karteikarte</h2>
        <input
          type="text"
          placeholder="Frage"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <input
          type="text"
          placeholder="Antwort"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Kategorie wählen</option>
          <option value="Woche 1: Programmierung & Grundlagen">
            Woche 1: Programmierung & Grundlagen
          </option>
          <option value="Woche 2: Webentwicklung & Unity">
            Woche 2: Webentwicklung & Unity
          </option>
          <option value="Woche 3: Gestaltung & Medienproduktion">
            Woche 3: Gestaltung & Medienproduktion
          </option>
        </select>

        <input
          type="text"
          placeholder="Unterthema (optional)"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          style={{ marginTop: '5px' }}
        />

        <textarea
          placeholder="Code (optional)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ fontFamily: 'monospace', minHeight: '100px', marginBottom: '10px' }}
        />
        <button onClick={handleAddCard}>Hinzufügen</button>
      </section>

      {/* Lernmodus */}
      {flashcards.length > 0 && currentCard && (
      <section style={{ marginTop: '2rem' }}>
        <h2>🧠 Lernmodus</h2>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="card-container"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Frage */}
            <div className="card-question">{currentCard.question}</div>

            {/* Antwort */}
            <div className="card-answer">
              {showAnswer ? currentCard.answer : '(Antwort versteckt)'}
            </div>

            {/* Optionaler Codeblock */}
            {currentCard.code && (
              <pre
                style={{
                  background: '#1e1e1e',
                  color: '#dcdcdc',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginTop: '1rem',
                  overflowX: 'auto',
                }}
              >
                <code>{currentCard.code}</code>
              </pre>
            )}

            {/* Hauptthema & Unterthema */}
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Kategorie: <strong>{currentCard.category}</strong>
            </p>
            {currentCard.subtitle && (
              <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.2rem' }}>
                Unterthema: {currentCard.subtitle}
              </p>
            )}

            {/* Bewertung */}
            <p style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Bewertung: <strong>{currentCard.rating || 'noch keine'}</strong>
            </p>

            {/* Antwort anzeigen/verstecken */}
            <button onClick={() => setShowAnswer(!showAnswer)}>
              {showAnswer ? 'Verstecken' : 'Antwort zeigen'}
            </button>

            {/* Bewertungsknöpfe */}
            <div style={{ marginTop: '1rem' }}>
              <p>Wie gut konntest du die Karte?</p>
              <button onClick={() => rateCard('good')}>😊 Gut</button>
              <button
                onClick={() => rateCard('medium')}
                style={{ margin: '0 0.5rem' }}
              >
                😐 Mittel
              </button>
              <button onClick={() => rateCard('bad')}>😕 Gar nicht</button>
            </div>

            {/* Karte löschen & bearbeiten */}
            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={() => {
                  const updated = flashcards.filter((_, i) => i !== currentIndex);
                  saveFlashcardsToStorage(updated);
                  setCurrentIndex(0);
                  setShowAnswer(false);
                }}
                style={{ backgroundColor: '#e74c3c', marginRight: '0.5rem' }}
              >
                Löschen
              </button>
              <button
                onClick={() => {
                  const card = flashcards[currentIndex];
                  setQuestion(card.question);
                  setAnswer(card.answer);
                  setCategory(card.category);
                  setSubtitle(card.subtitle || '');
                  setCode(card.code || '');
                  const updated = flashcards.filter((_, i) => i !== currentIndex);
                  saveFlashcardsToStorage(updated);
                  setCurrentIndex(0);
                  setShowAnswer(false);
                }}
                style={{ backgroundColor: '#f39c12', color: 'black' }}
              >
                Bearbeiten
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    )}
    </div>
  );
}

export default App;