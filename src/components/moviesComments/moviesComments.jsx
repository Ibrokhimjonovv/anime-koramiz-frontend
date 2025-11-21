"use client";
import React, { useState, useEffect, useContext } from "react";
import { global_api } from "../../app/_app";
import "./moviesComments.scss";
import Link from "next/link";
import { AccessContext } from "@/context/context";

const MovieComments = ({ movieId, id, initialComments = [] }) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Agar initialComments bo'lsa loading kerak emas
  const accessToken = localStorage.getItem("accessToken");
  const { userData } = useContext(AccessContext);

  const inappropriateWords = [
    "fuck", "bitch", "kutabare", "ske", "jalap", "ko't", "kot", 
    "dalbayob", "suka", "shit", "фаκ", "бич", "ске", "жалап", 
    "далбайоб", "сука", "щит",
  ];


  // Yangi kommentariya qo'shish
  const handleAddComment = async () => {
    if (!newComment.trim() || error) return;
    
    try {
      const response = await fetch(`${global_api}/films-comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          movie: movieId,
          text: newComment.trim(),
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments((prev) => [newCommentData, ...prev]);
        setNewComment("");
        setError("");
      } else {
        console.error("Failed to add comment");
        setError("Izoh qo'shishda xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Tarmoq xatosi");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}, ${day}.${month}.${year}`;
  };

  const handleChange = (e) => {
    const comment = e.target.value;
    
    if (comment.length <= 300) {
      setNewComment(comment);
      
      // Ahloqiy buzuq so'zlarni tekshirish
      const containsInappropriateWord = inappropriateWords.some((word) =>
        comment.toLowerCase().includes(word.toLowerCase())
      );
      
      if (containsInappropriateWord) {
        setError("Iltimos, ahloqiy buzuq so'zlardan foydalanmang.");
      } else {
        setError("");
      }
    }
  };

  // Izohni o'chirish
  const handleDeleteComment = async (commentId) => {
    if (!userData?.is_superuser) return;
    
    try {
      const response = await fetch(
        `${global_api}/films-comments/${commentId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  if (loading) {
    return (
      <div id="comments">
        <h3>Izohlar</h3>
        <div className="loading-comments">Izohlar yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div id="comments">
      <h3>Izohlar ({comments.length})</h3>
      
      <ul className="users-comments">
        {comments.map((comment) => (
          <li key={comment.id}>
            <div className="comment-header">
              <span className="comment-user">
                {comment.user || comment.username}
              </span>
              <span className="comment-date">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <p className="comment-text">{comment.text}</p>
            {userData?.is_superuser && (
              <button 
                className="delete-comment-btn"
                onClick={() => handleDeleteComment(comment.id)}
              >
                O'chirish
              </button>
            )}
          </li>
        ))}
        {/* {comments.length > 0 ? (
        ) : (
          <li className="no-comments">
            Hozircha izohlar mavjud emas. Birinchi bo'lib izoh qoldiring!
          </li>
        )} */}
      </ul>

      <div className="comment-input-section">
        <div className="letter-count">{newComment.length}/300</div>
        
        <textarea
          value={newComment}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={
            accessToken
              ? comments.length > 0
                ? "Izoh yozing..."
                : "Birinchi izohni yozing!"
              : "Izoh yozish uchun shaxsiy xisobingizga kiring"
          }
          disabled={!accessToken}
          maxLength={300}
          rows={3}
        />
        
        {error && <div className="error-message">{error}</div>}
        
        {newComment.length === 300 && (
          <div className="warning-message">
            300 ta harfdan ko'p yozish mumkin emas!
          </div>
        )}

        {accessToken ? (
          <button 
            onClick={handleAddComment} 
            disabled={error !== "" || !newComment.trim()}
          >
            Izoh qo'shish
          </button>
        ) : (
          <div id="btn-cont">
            <Link href="/login">Kirish...</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieComments;