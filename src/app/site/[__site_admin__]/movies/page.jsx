"use client"

import { useState, useEffect } from "react";
import AdminPanel from "../page";
import { global_api } from "../../../_app";
import AddMovie from "../../../../components/admin-add-movies/add-movies";
import "../../../../../styles/admin.scss";

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [filmsDepartment, setDepartments] = useState([]);

  // Form state
  // Form state
  const [formData, setFormData] = useState({
    movies_name: "",
    movies_description: "",
    movies_url: "",
    movies_preview_url: "",
    country: "",
    count: 0,
    year: "",
    genre: "",
    all_series: "",
    department_id: "",
    is_possible: false, // 🔥 YANGI QO'SHILDI
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Filmlarni olish
  useEffect(() => {
    fetchMovies();
    fetchDepartments();
  }, []);

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

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${global_api}/departments/`);
      if (response.ok) {
        const departments = await response.json();
        setDepartments(departments.data);
      }
    } catch (error) {
      console.error("Bo'limlarni olishda xato:", error);
    }
  };

  const fetchMovieById = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${global_api}/movies/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch movie details");
      return await response.json();
    } catch (error) {
      console.error("Film ma'lumotlarini olishda xato:", error);
      throw error;
    }
  };

  const handleEdit = async (movie) => {
    // Modalni darhol ochish
    setSelectedMovie(movie);
    setFormData({
      movies_name: movie.movies_name || "",
      movies_description: movie.movies_description || "",
      movies_url: movie.movies_url || "",
      movies_preview_url: movie.movies_preview_url || "",
      country: movie.country || "",
      count: movie.count || "",
      year: movie.year || "",
      genre: movie.genre || "",
      all_series: movie.all_series || "",
      department_id: movie.department_id || "",
      is_possible: movie.is_possible || false, // 🔥 YANGI QO'SHILDI
    });

    // Keyin batafsil ma'lumotlarni yuklash
    setEditLoading(true);
    try {
      const movieDetails = await fetchMovieById(movie.id);
      setFormData({
        movies_name: movieDetails.movies_name || "",
        movies_description: movieDetails.movies_description || "",
        movies_url: movieDetails.movies_url || "",
        movies_preview_url: movieDetails.movies_preview_url || "",
        country: movieDetails.country || "",
        count: movieDetails.count || "",
        year: movieDetails.year || "",
        genre: movieDetails.genre || "",
        all_series: movieDetails.all_series || "",
        department_id: movieDetails.department_id || "",
        is_possible: movieDetails.is_possible || false, // 🔥 YANGI QO'SHILDI
      });
    } catch (error) {
      alert("Film ma'lumotlarini olishda xatolik yuz berdi");
    } finally {
      setEditLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      // 🔥 Checkbox uchun alohida ishlov
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    if (!selectedMovie) return;

    const updatedMovie = {
      ...formData,
      count: parseInt(formData.count) || 0,
      // department_id ni yuborish (agar o'zgartirilgan bo'lsa)
      ...(formData.department_id && { department_id: parseInt(formData.department_id) }),
      is_possible: formData.is_possible,
    };

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${global_api}/movies/${selectedMovie.id}/`, {
        method: "PUT", // PUT o'rniga PATCH ishlating
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedMovie),
      });

      if (response.ok) {
        const updatedMovieData = await response.json();
        setMovies(prevMovies =>
          prevMovies.map(movie =>
            movie.id === selectedMovie.id ? updatedMovieData : movie
          )
        );
        setSelectedMovie(null);
        alert("Muvaffaqiyatli yangilandi!");
      } else {
        const errorData = await response.json();
        console.error("Xatolik ma'lumotlari:", errorData);
        alert("Yangilashda xatolik: " + JSON.stringify(errorData));
      }
    } catch (error) {
      alert("Server error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatdan ham ushbu filmni o'chirmoqchimisiz?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${global_api}/movies/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMovies(prevMovies => prevMovies.filter(movie => movie.id !== id));
        alert("Film muvaffaqiyatli o'chirildi!");
      } else {
        const errorText = await response.text();
        alert("Xatolik: " + errorText);
      }
    } catch (error) {
      alert("Serverda xatolik yuz berdi!");
    }
  };

  const handleMovieAdded = (newMovie) => {
    setMovies(prevMovies => [newMovie, ...prevMovies]);
  };

  if (loading) {
    return (
      <div id="admin-users">
        <AdminPanel />
        <div className="loading">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div id="admin-users">
      <AdminPanel />
      <AddMovie filmsDepartment={filmsDepartment} onMovieAdded={handleMovieAdded} />

      {/* Edit Modal */}
      {/* Edit Modal */}
      {selectedMovie && (
        <div className="update">
          <h2>Filmni taxrirlash</h2>

          {editLoading && <div className="loading-small">Ma'lumotlar yuklanmoqda...</div>}

          {[
            { label: "Film nomi", name: "movies_name", type: "text" },
            { label: "Film haqida", name: "movies_description", type: "text" },
            { label: "Film manzili (urli)", name: "movies_url", type: "text" },
            { label: "Film rasmi (urli)", name: "movies_preview_url", type: "text" },
            { label: "Davlati", name: "country", type: "text" },
            { label: "Ko'rishlar soni", name: "count", type: "number" },
            { label: "Yili", name: "year", type: "text" },
            { label: "Janri", name: "genre", type: "text" },
            { label: "Barcha qismlar", name: "all_series", type: "text" },
          ].map((field) => (
            <div key={field.name} >
              <br />
              <label>{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                disabled={editLoading}
              />
            </div>
          ))}

          <label>Bo'lim</label>
          <select
            name="department_id"
            value={formData.department_id}
            onChange={handleInputChange}
            disabled={editLoading}
          >
            <option value="">Bo'lim tanlang</option>
            {filmsDepartment.map((dep) => (
              <option key={dep.department_id} value={dep.department_id}>
                {dep.department_name}
              </option>
            ))}
          </select>

          {/* 🔥 YANGI: is_possible checkbox */}
          <div className="checkbox-group">
            <label htmlFor="is_possible" className="checkbox-label">
              <input
                type="checkbox"
                name="is_possible"
                id="is_possible"
                checked={formData.is_possible}
                onChange={handleInputChange}
                disabled={editLoading}
              />
              <span className="checkmark"></span>
              O'zbekistonda ko'rinmasin
            </label>
            <small className="checkbox-description">
              Agar belgilansa, bu film O'zbekiston hududida ko'rinmaydi
            </small>
          </div>

          <button onClick={handleUpdate} disabled={editLoading}>
            {editLoading ? "Yuklanmoqda..." : "Saqlash"}
          </button>
          <button onClick={() => setSelectedMovie(null)} disabled={editLoading}>
            Bekor qilish
          </button>
        </div>
      )}

      {/* Movies Table */}
      {/* Movies Table */}
      <div className="users-table">
        {error && <div className="error">{error}</div>}

        <table>
          <thead>
            <tr>
              <th className="desktop-mode">Rasmi</th>
              <th style={{ maxWidth: '230px' }}>Film nomi</th>
              <th style={{ maxWidth: '200px' }} className="desktop-mode">Haqida</th>
              <th className="desktop-mode">Davlati</th>
              <th>Ko'rishlar soni</th>
              <th className="desktop-mode">Yuklangan sana</th>
              <th>Qismlar soni</th>
              <th>O'zbekistonda ko'rinmasin</th> {/* 🔥 YANGI USTUN */}
              <th>Taxrirlash</th>
              <th>O'chirish</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr key={movie.id}>
                <td className="desktop-mode">
                  <img src={movie.movies_preview_url} alt={movie.movies_name} />
                </td>
                <td style={{ maxWidth: '230px' }}>
                  <p>{movie.movies_name}</p>
                </td>
                <td style={{ maxWidth: '200px' }} className="desktop-mode">
                  <p>{movie.movies_description}</p>
                </td>
                <td className="desktop-mode">{movie.country}</td>
                <td>{movie.count}</td>
                <td className="desktop-mode">{formatDate(movie.created_at)}</td>
                <td>{movie.series_count || 0}</td>
                <td>
                  {/* 🔥 YANGI: is_possible statusi */}
                  <span className={`status ${movie.is_possible ? 'hidden' : 'visible'}`}>
                    {movie.is_possible ? "❌ Ko'rinmaydi" : "✅ Ko'rinadi"}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(movie)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={30}>
                      <path d="M384 224v184a40 40 0 01-40 40H104a40 40 0 01-40-40V168a40 40 0 0140-40h167.48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
                      <path d="M459.94 53.25a16.06 16.06 0 00-23.22-.56L424.35 65a8 8 0 000 11.31l11.34 11.32a8 8 0 0011.34 0l12.06-12c6.1-6.09 6.67-16.01.85-22.38zM399.34 90L218.82 270.2a9 9 0 00-2.31 3.93L208.16 299a3.91 3.91 0 004.86 4.86l24.85-8.35a9 9 0 003.93-2.31L422 112.66a9 9 0 000-12.66l-9.95-10a9 9 0 00-12.71 0z" />
                    </svg>
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(movie.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={30}>
                      <path d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
                      <path stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="32" d="M80 112h352" />
                      <path d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMovies;