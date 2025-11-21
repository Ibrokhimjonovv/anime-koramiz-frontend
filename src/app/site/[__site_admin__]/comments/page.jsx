"use client"

import { useEffect, useState } from "react";
import AdminPanel from "../page";
import { global_api } from "../../../_app";
import "../../../../../styles/admin.scss"

const AdminComments = () => {
  const [openMovieId, setOpenMovieId] = useState(null);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${global_api}/movies/`);
        if (!response.ok) throw new Error("Failed to fetch movies");
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${global_api}/films-comments/`);
        if (!response.ok) throw new Error("Failed to fetch comments");
        const data = await response.json();
        
        // Eng yangi comment birinchi bo'lishi uchun teskari tartibda saralash
        const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setComments(sortedData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, []);

  const toggleSeries = (movieId) => {
    setOpenMovieId(openMovieId === movieId ? null : movieId);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(
        `${global_api}/films-comments/${commentId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setComments(comments.filter((com) => com.id !== commentId));
        alert("Comment deleted successfully!");
      } else {
        alert("Failed to delete comment");
      }
    } catch (error) {
      alert("Server error");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  // Filmga tegishli izohlarni topish va ularni guruhlash
  const getMovieComments = (movieId) => {
    return comments.filter(comment => comment.movie === movieId);
  };

  // Filmlarni eng so'ngi kommentga qarab saralash
  const getSortedMovies = () => {
    return [...movies].sort((a, b) => {
      const commentsA = getMovieComments(a.id);
      const commentsB = getMovieComments(b.id);
      
      const latestCommentA = commentsA[0]?.created_at || 0;
      const latestCommentB = commentsB[0]?.created_at || 0;
      
      return new Date(latestCommentB) - new Date(latestCommentA);
    });
  };

  return (
    <div id="admin-users">
      <AdminPanel />
      <h2>Film Izohlari</h2>
      {error && <p>Error: {error}</p>}
      <div className="users-table">
        <table id="qwi">
          <thead>
            <tr>
              <th>Film nomi</th>
              <th>Izohlar soni</th>
              <th>Izohlar</th>
            </tr>
          </thead>
          <tbody>
            {getSortedMovies().map((movie) => {
              const movieComments = getMovieComments(movie.id);
              return (
                <tr key={movie.id}>
                  <td
                    onClick={() => toggleSeries(movie.id)}
                    style={{ cursor: "pointer", width: "300px" }}
                    className="nam"
                  >
                    {movie.movies_name}
                    {movieComments.length ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        style={{ fill: "#fff", transform: `${openMovieId === movie.id ? "rotate(180deg)" : ""}`, msfilter: "" }}
                      >
                        <path d="m18.707 12.707-1.414-1.414L13 15.586V6h-2v9.586l-4.293-4.293-1.414 1.414L12 19.414z" />
                      </svg>
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="align" style={{ width: "100px" }}>
                    {movieComments.length}{" "}
                    {movieComments.length > 0 ? "ta" : ""}
                  </td>
                  <td>
                    {openMovieId === movie.id && (
                      <ul>
                        {movieComments.map((comment) => (
                          <li key={comment.id}>
                            <div>
                              <div>
                                <span className="comment-author">
                                  {comment.user}:
                                </span>{" "}
                                <span className="date">
                                  {formatDate(comment.created_at)}
                                </span>
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                >
                                  Izohni o'chirish
                                </button>
                              </div>
                              <span className="comment-text">
                                {comment.text}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminComments;