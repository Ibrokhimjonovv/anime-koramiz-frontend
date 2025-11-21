"use client"
import { useEffect, useState } from "react";
import { global_api } from "../../../_app";
import AdminPanel from "../page";
import "../../../../../styles/admin.scss"

const AdminSeries = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [episodes, setEpisodes] = useState({});
  const [episodesToAdd, setEpisodesToAdd] = useState([{ title: "", video_url: "" }]); // Ko'p qismlar uchun
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [editingEpisodeId, setEditingEpisodeId] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [modal, setModal] = useState(false);
  const [openMovieId, setOpenMovieId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Film qismlarini olish
  const fetchEpisodesForMovie = async (movieId) => {
    try {
      const response = await fetch(`${global_api}/series/?movie=${movieId}`);
      if (response.ok) {
        const episodesData = await response.json();
        setEpisodes(prev => ({
          ...prev,
          [movieId]: episodesData
        }));
      }
    } catch (error) {
      console.error("Qismlarni olishda xato:", error);
    }
  };

  const toggleSeries = async (movieId) => {
    if (openMovieId === movieId) {
      setOpenMovieId(null);
    } else {
      setOpenMovieId(movieId);
      if (!episodes[movieId]) {
        await fetchEpisodesForMovie(movieId);
      }
    }
  };

  // Qidiruvni boshqarish
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = movies.filter(movie =>
        movie.movies_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMovies(filtered);
    } else {
      setFilteredMovies([]);
    }
  }, [searchTerm, movies]);

  // Yangi qism qo'shish inputini qo'shish
  const addEpisodeField = () => {
    setEpisodesToAdd(prev => [...prev, { title: "", video_url: "" }]);
  };

  // Qism inputlarini yangilash
  const updateEpisodeField = (index, field, value) => {
    setEpisodesToAdd(prev =>
      prev.map((episode, i) =>
        i === index ? { ...episode, [field]: value } : episode
      )
    );
  };

  // Qism inputini o'chirish
  const removeEpisodeField = (index) => {
    if (episodesToAdd.length > 1) {
      setEpisodesToAdd(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddEpisodes = async () => {
    if (!selectedMovieId) {
      alert("Iltimos, filmni tanlang!");
      return;
    }

    // Faqat to'ldirilgan qismlarni filtrlash
    const validEpisodes = episodesToAdd.filter(ep => ep.title.trim() && ep.video_url.trim());

    if (validEpisodes.length === 0) {
      alert("Iltimos, kamida bitta qism nomi va manzilini kiriting!");
      return;
    }

    const token = localStorage.getItem("accessToken");
    setLoadingA(true);

    try {
      const newEpisodes = [];

      // Ketma-ketlikda so'rov yuborish
      for (let i = 0; i < validEpisodes.length; i++) {
        const episode = validEpisodes[i];

        const response = await fetch(`${global_api}/series/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: episode.title,
            video_url: episode.video_url,
            movie: selectedMovieId,
          }),
        });

        if (response.ok) {
          const newEpisode = await response.json();
          newEpisodes.push(newEpisode);

        } else {
          console.error(`${i + 1}-qism qo'shishda xatolik`);
        }
      }

      if (newEpisodes.length > 0) {
        // Frontend state ni yangilash
        setEpisodes(prev => ({
          ...prev,
          [selectedMovieId]: [...(prev[selectedMovieId] || []), ...newEpisodes]
        }));

        alert(`${newEpisodes.length} ta qism muvaffaqiyatli qo'shildi!`);
        setModal(false);
        resetForm();
      } else {
        alert("Hech qanday qism qo'shilmadi");
      }
    } catch (error) {
      alert("Server xatosi");
    } finally {
      setLoadingA(false);
    }
  };

  const handleEditEpisode = async () => {
    if (!selectedMovieId || !episodesToAdd[0].title || !episodesToAdd[0].video_url) {
      alert("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    const token = localStorage.getItem("accessToken");
    setLoadingA(true);

    try {
      const response = await fetch(`${global_api}/series/${editingEpisodeId}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: episodesToAdd[0].title,
          video_url: episodesToAdd[0].video_url,
          movie: selectedMovieId,
        }),
      });

      if (response.ok) {
        const updatedEpisode = await response.json();

        setEpisodes(prev => ({
          ...prev,
          [selectedMovieId]: prev[selectedMovieId]?.map(ep =>
            ep.id === editingEpisodeId ? updatedEpisode : ep
          ) || [updatedEpisode]
        }));

        setModal(false);
        resetForm();
        alert("Qism muvaffaqiyatli yangilandi!");
      } else {
        alert("Qismni yangilashda xatolik");
      }
    } catch (error) {
      alert("Server xatosi");
    } finally {
      setLoadingA(false);
    }
  };

  const handleDeleteEpisode = async (episodeId, movieId) => {
    if (!window.confirm("Haqiqatan ham ushbu qismni o'chirmoqchimisiz?")) return;

    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${global_api}/series/${episodeId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setEpisodes(prev => ({
          ...prev,
          [movieId]: prev[movieId]?.filter(ep => ep.id !== episodeId) || []
        }));
        alert("Qism muvaffaqiyatli o'chirildi!");
      } else {
        alert("Qismni o'chirishda xatolik");
      }
    } catch (error) {
      alert("Server xatosi");
    }
  };

  const resetForm = () => {
    setEpisodesToAdd([{ title: "", video_url: "" }]);
    setEditingEpisodeId(null);
    setSelectedMovieId("");
    setSearchTerm("");
    setFilteredMovies([]);
  };

  const startEditEpisode = (episode, movieId) => {
    setEpisodesToAdd([{ title: episode.title, video_url: episode.video_url }]);
    setEditingEpisodeId(episode.id);
    setSelectedMovieId(movieId);
    setModal(true);
  };

  return (
    <div id="admin-users">
      <AdminPanel />
      <h2>
        Film qismlari
        <button
          onClick={() => {
            setModal(true);
            resetForm();
          }}
        >
          Qism qo'shish
        </button>
      </h2>

      {error && <p>Xatolik: {error}</p>}

      <div className="users-table">
        <table id="qwi">
          <thead>
            <tr>
              <th>Film nomi</th>
              <th>Qismlari</th>
              <th>Qismlar soni</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr key={movie.id}>
                <td
                  onClick={() => toggleSeries(movie.id)}
                  style={{ cursor: "pointer" }}
                  className="nam"
                >
                  {movie.movies_name}
                  {movie.series_count ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      style={{
                        fill: "#fff",
                        transform: openMovieId === movie.id ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease"
                      }}
                    >
                      <path d="m18.707 12.707-1.414-1.414L13 15.586V6h-2v9.586l-4.293-4.293-1.414 1.414L12 19.414z" />
                    </svg>
                  ) : (
                    ""
                  )}
                </td>
                <td className="align">
                  {openMovieId === movie.id && episodes[movie.id] && (
                    <div className="episodes-list">
                      {episodes[movie.id].map((episode) => (
                        <div key={episode.id} className="episode-item">
                          <span>{episode.title}</span>
                          <div className="episode-actions">
                            <button onClick={() => startEditEpisode(episode, movie.id)}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="ionicon"
                                viewBox="0 0 512 512"
                                width={20}
                              >
                                <path
                                  d="M384 224v184a40 40 0 01-40 40H104a40 40 0 01-40-40V168a40 40 0 0140-40h167.48"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="32"
                                />
                                <path d="M459.94 53.25a16.06 16.06 0 00-23.22-.56L424.35 65a8 8 0 000 11.31l11.34 11.32a8 8 0 0011.34 0l12.06-12c6.1-6.09 6.67-16.01.85-22.38zM399.34 90L218.82 270.2a9 9 0 00-2.31 3.93L208.16 299a3.91 3.91 0 004.86 4.86l24.85-8.35a9 9 0 003.93-2.31L422 112.66a9 9 0 000-12.66l-9.95-10a9 9 0 00-12.71 0z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteEpisode(episode.id, movie.id)}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="ionicon"
                                viewBox="0 0 512 512"
                                width={20}
                              >
                                <path
                                  d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="32"
                                />
                                <path
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeMiterlimit="10"
                                  strokeWidth="32"
                                  d="M80 112h352"
                                />
                                <path
                                  d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="32"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td>{movie.series_count || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="update">
          <h2>{editingEpisodeId ? "Qismni taxrirlash" : "Qism qo'shish"}</h2>

          <label>Filmni qidirish</label>
          <input
            type="text"
            placeholder="Film nomi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {filteredMovies.length > 0 && (
            <div className="search-results">
              {filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="result-item"
                  onClick={() => {
                    setSelectedMovieId(movie.id);
                    setSearchTerm(movie.movies_name);
                    setFilteredMovies([]);
                  }}
                >
                  {movie.movies_name}
                </div>
              ))}
            </div>
          )}

          {
            !editingEpisodeId && !selectedMovieId && movies.length > 0 && (
              <div className="auto-select-info">
                <button
                  type="button"
                  className="auto-select-btn"
                  onClick={() => {
                    const latestMovie = movies[0];
                    setSelectedMovieId(latestMovie.id);
                    setSearchTerm(latestMovie.movies_name);
                  }}
                >
                  {movies[0].movies_name} (eng oxirgi)
                </button>
              </div>
            )
          }

          <label>Filmni tanlash</label>
          <select
            value={selectedMovieId}
            onChange={(e) => setSelectedMovieId(e.target.value)}
          >
            <option value="">Film tanlang</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.movies_name}
              </option>
            ))}
          </select>
          {episodesToAdd.map((episode, index) => {
            // Bir xil nom tekshiruvi
            const isDuplicateTitle = episodesToAdd.some((ep, i) =>
              i !== index && ep.title.trim() === episode.title.trim() && episode.title.trim() !== ""
            );

            // Bir xil URL tekshiruvi
            const isDuplicateUrl = episodesToAdd.some((ep, i) =>
              i !== index && ep.video_url.trim() === episode.video_url.trim() && episode.video_url.trim() !== ""
            );

            return (
              <div key={index} className="episode-field-group">
                <label>{index + 1}-qism ma'lumotlari</label>

                {/* Qism nomi inputi */}
                <input
                  type="text"
                  value={episode.title}
                  onChange={(e) => updateEpisodeField(index, 'title', e.target.value)}
                  placeholder="Qism nomi"
                  className={isDuplicateTitle ? "error-input" : ""}
                />
                {isDuplicateTitle && (
                  <div className="error-message">
                    ⚠️ Bu nom bilan boshqa qism mavjud!
                  </div>
                )}

                {/* Qism manzili inputi */}
                <input
                  type="text"
                  value={episode.video_url}
                  onChange={(e) => updateEpisodeField(index, 'video_url', e.target.value)}
                  placeholder="Qism manzili"
                  className={`mt-10 ${isDuplicateUrl ? "error-input" : ""}`}
                />
                {isDuplicateUrl && (
                  <div className="error-message">
                    ⚠️ Bu manzil bilan boshqa qism mavjud!
                  </div>
                )}

                {episodesToAdd.length > 1 && !editingEpisodeId && (
                  <button
                    type="button"
                    className="remove-episode-btn"
                    onClick={() => removeEpisodeField(index)}
                  >
                    ✕ O'chirish
                  </button>
                )}
              </div>
            );
          })}

          {!editingEpisodeId && (
            <button type="button" onClick={addEpisodeField} className="add-more-btn">
              + Yana qism qo'shish
            </button>
          )}

          <button
            onClick={editingEpisodeId ? handleEditEpisode : handleAddEpisodes}
            disabled={loadingA}
          >
            {loadingA
              ? "Yuklanmoqda..."
              : editingEpisodeId
                ? "Yangilash"
                : "Qismlarni qo'shish"}
          </button>

          <button type="button" onClick={() => {
            setModal(false);
            resetForm();
          }}>
            Bekor qilish
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSeries;