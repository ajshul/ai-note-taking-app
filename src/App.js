import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Menu, X, AlertCircle, Loader2, Save } from 'lucide-react';
import rehypeMathJax from 'rehype-mathjax';
import remarkMath from 'remark-math';

const Alert = ({ children }) => (
  <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 m-4" role="alert">
    {children}
  </div>
);

const Button = ({ onClick, children, disabled, variant }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded ${
      variant === 'outline'
        ? 'border border-gray-300 text-gray-700'
        : 'bg-blue-500 text-white'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
  >
    {children}
  </button>
);

const NoteApp = () => {
  const [notes, setNotes] = useState([]);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    saveNotes();
  }, [notes]);

  const loadNotes = () => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
      setCurrentNoteId(JSON.parse(savedNotes)[0]?.id || null);
    } else {
      createNewNote();
    }
  };

  const saveNotes = () => {
    localStorage.setItem('notes', JSON.stringify(notes));
  };

  const createNewNote = () => {
    const newNote = {
      id: Date.now().toString(),
      content: '',
      title: `New Note ${notes.length + 1}`
    };
    setNotes(prevNotes => [...prevNotes, newNote]);
    setCurrentNoteId(newNote.id);
  };

  const getCurrentNote = () => {
    return notes.find(note => note.id === currentNoteId) || { content: '' };
  };

  const handleNoteChange = (newContent) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === currentNoteId ? { ...note, content: newContent } : note
    ));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      processCurrentNote();
    }
  };

  const addBreak = () => {
    const currentNote = getCurrentNote();
    const newContent = currentNote.content + '\n\n---\n\n';
    handleNoteChange(newContent);
  };

  const processCurrentNote = async () => {
    setIsProcessing(true);
    const currentNote = getCurrentNote();
    const sections = currentNote.content.split('---');
    const contextNotes = sections.slice(0, -1).join('---').trim();
    const notesToImprove = sections.length > 1 ? sections[sections.length - 1].trim() : currentNote.content.trim();

    const prompt = `
You are an AI assistant tasked with improving class notes for better exam review. Here are the notes to improve:
<class_notes>
${notesToImprove}
</class_notes>
${contextNotes ? `\nHere is the context from earlier in the notes (all the notes before the notes that you will improve):\n<context_notes>\n${contextNotes}\n</context_notes>` : ''}
Your task is to take these notes and significantly improve them by making them more detailed, well-structured, and suitable for exam review. Follow these steps:
1. Expand on the existing notes by adding more details, explanations, and relevant information. Use your knowledge to flesh out concepts, provide examples, and clarify any potentially confusing points.
2. Format the improved notes using markdown syntax. Use appropriate headers, bullet points, numbered lists, and other markdown elements to enhance readability and organization.
3. Identify any questions present in the original notes. Answer these questions by seamlessly integrating the answers into the expanded text. Make sure the answers are comprehensive and provide valuable insights.
4. Improve the overall structure of the notes. Organize information logically, grouping related concepts together and creating a clear hierarchy of ideas.
5. Add section headers to break up the content into manageable chunks, making it easier for students to navigate and review specific topics.
6. If appropriate, include a brief summary at the end of each major section to reinforce key points.
7. Ensure that the language used is clear, concise, and appropriate for academic study.
Present your improved and expanded notes within <improved_notes> tags. Use markdown formatting within these tags to structure the content.
Remember, your goal is to transform the original notes into a comprehensive, well-organized study resource that will significantly aid in exam preparation.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant that improves class notes for exam review." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000 // Increased token limit for more detailed responses
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const improvedContent = data.choices[0].message.content;

      // Extract the content between <improved_notes> tags
      const improvedNotesMatch = improvedContent.match(/<improved_notes>([\s\S]*)<\/improved_notes>/);
      const improvedNotes = improvedNotesMatch ? improvedNotesMatch[1].trim() : improvedContent;

      const newContent = sections.slice(0, -1).join('---') + 
        (sections.length > 1 ? '\n\n---\n\n' : '') + 
        improvedNotes;

      handleNoteChange(newContent);
    } catch (error) {
      console.error("Error processing note:", error);
      // Here you might want to show an error message to the user
    } finally {
      setIsProcessing(false);
    }
  };

  const exportNote = () => {
    const currentNote = getCurrentNote();
    const blob = new Blob([currentNote.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNote.title || 'note'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-gray-100 w-64 flex-shrink-0 ${isSidebarOpen ? '' : 'hidden'} md:block`}>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Notes</h2>
          <Button onClick={createNewNote} className="w-full mb-4">New Note</Button>
          <div className="space-y-2">
            {notes.map(note => (
              <div 
                key={note.id} 
                className={`p-2 rounded cursor-pointer ${note.id === currentNoteId ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
                onClick={() => setCurrentNoteId(note.id)}
              >
                {note.title || 'Untitled Note'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm z-10">
          <div className="p-4 flex items-center justify-between">
            <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)} variant="outline">
              {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <h1 className="text-xl font-semibold">AI-Enhanced Note-Taking App</h1>
            <div>
              <Button onClick={addBreak} disabled={isProcessing} className="mr-2">
                Add Break
              </Button>
              <Button onClick={exportNote} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <p className="font-bold">Tip</p>
            <p>Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to enhance your notes with AI.</p>
          </Alert>
        </div>

        <div className="flex-1 overflow-auto p-4 relative">
          <MDEditor
            value={getCurrentNote().content}
            onChange={handleNoteChange}
            onKeyDown={handleKeyDown}
            previewOptions={{
              rehypePlugins: [rehypeMathJax],
              remarkPlugins: [remarkMath],
            }}
            height="100%"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteApp;