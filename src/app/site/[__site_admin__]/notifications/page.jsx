'use client'; // Client component uchun zarur

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { useState } from 'react';
import { global_api } from "../../../_app";
// import "./admin-users.scss";
import AdminPanel from "../page";
import "../../../../../styles/admin.scss"

const CreateNotification = () => {
  const [title, setTitle] = useState(""); // Sarlavha uchun
  const [text, setText] = useState(""); // Xabar matni uchun
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("accessToken");

  // Sarlavha uchun editor
  const titleEditor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: title,
    onUpdate: ({ editor }) => {
      setTitle(editor.getHTML());
    },
  });

  // Matn uchun editor
  const textEditor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: text,
    onUpdate: ({ editor }) => {
      setText(editor.getHTML());
    },
  });

  const addImage = (editor) => {
    const url = window.prompt('Rasm URL manzilini kiriting:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = (editor) => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) {
      alert("Sarlavha va xabar matni bo‘sh bo‘lishi mumkin emas!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${global_api}/notifications/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, text }),
      });

      if (!response.ok) {
        throw new Error("Xabarni yuborishda xatolik yuz berdi");
      }
      setTitle("");
      setText("");
      if (titleEditor) titleEditor.commands.setContent("");
      if (textEditor) textEditor.commands.setContent("");
      alert("Xabar muvaffaqiyatli yuborildi!");
    } catch (error) {
      console.error("Error posting notification:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!titleEditor || !textEditor) {
    return <div>Editor yuklanmoqda...</div>;
  }

  return (
    <div className="create-notification">
      <AdminPanel />
      <h2>Yangi Xabar Qo'shish</h2>
      <form onSubmit={handleSubmit}>
        <label>Xabar sarlavhasi:</label>
        
        {/* Sarlavha uchun editor toolbar */}
        <div className="menu-bar">
          <button
            type="button"
            onClick={() => titleEditor.chain().focus().toggleBold().run()}
            className={titleEditor.isActive('bold') ? 'is-active' : ''}
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => titleEditor.chain().focus().toggleItalic().run()}
            className={titleEditor.isActive('italic') ? 'is-active' : ''}
          >
            Italic
          </button>
          <button
            type="button"
            onClick={() => titleEditor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={titleEditor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => titleEditor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={titleEditor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => setLink(titleEditor)}
            className={titleEditor.isActive('link') ? 'is-active' : ''}
          >
            Link
          </button>
          <button
            type="button"
            onClick={() => titleEditor.chain().focus().setTextAlign('left').run()}
            className={titleEditor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          >
            Chap
          </button>
          <button
            type="button"
            onClick={() => titleEditor.chain().focus().setTextAlign('center').run()}
            className={titleEditor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          >
            Markaz
          </button>
          <button
            type="button"
            onClick={() => titleEditor.chain().focus().setTextAlign('right').run()}
            className={titleEditor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          >
            O'ng
          </button>
        </div>
        <EditorContent editor={titleEditor} className="editor-content title-editor" />
        
        <label>Xabar matni:</label>
        {/* Matn uchun editor toolbar */}
        <div className="menu-bar">
          <button
            type="button"
            onClick={() => textEditor.chain().focus().toggleBold().run()}
            className={textEditor.isActive('bold') ? 'is-active' : ''}
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => textEditor.chain().focus().toggleItalic().run()}
            className={textEditor.isActive('italic') ? 'is-active' : ''}
          >
            Italic
          </button>
          <button
            type="button"
            onClick={() => textEditor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={textEditor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => textEditor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={textEditor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => textEditor.chain().focus().toggleBulletList().run()}
            className={textEditor.isActive('bulletList') ? 'is-active' : ''}
          >
            Bullet List
          </button>
          <button
            type="button"
            onClick={() => textEditor.chain().focus().toggleOrderedList().run()}
            className={textEditor.isActive('orderedList') ? 'is-active' : ''}
          >
            Ordered List
          </button>
          <button
            type="button"
            onClick={() => setLink(textEditor)}
            className={textEditor.isActive('link') ? 'is-active' : ''}
          >
            Link
          </button>
          <button
            type="button"
            onClick={() => addImage(textEditor)}
          >
            Rasm
          </button>
          <button
            type="button"
            onClick={() => textEditor.chain().focus().setTextAlign('left').run()}
            className={textEditor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          >
            Chap
          </button>
          <button
            type="button"
            onClick={() => textEditor.chain().focus().setTextAlign('center').run()}
            className={textEditor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          >
            Markaz
          </button>
          <button
            type="button"
            onClick={() => textEditor.chain().focus().setTextAlign('right').run()}
            className={textEditor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          >
            O'ng
          </button>
        </div>
        
        <EditorContent editor={textEditor} className="editor-content text-editor" />

        <button type="submit" disabled={loading}>
          {loading ? "Yuklanmoqda..." : "Xabarni Yuborish"}
        </button>
      </form>
    </div>
  );
};

export default CreateNotification;