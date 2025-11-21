import React, { useState, useEffect, useContext } from "react";
import { global_api } from "../../app/_app";
import "./add-movies.scss";
import { AccessContext } from "@/context/context";

const AddMovie = ({ filmsDepartment, onMovieAdded }) => { // onMovieAdded prop qo'shildi
  const [formData, setFormData] = useState({
    movies_name: "",
    movies_description: "",
    movies_url: "",
    movies_preview_url: "",
    country: "",
    count: 0,
    all_series: "",
    created_at: new Date().toISOString(),
    add_departments: "",
    year: "",
    genre: "",
    is_possible: false,
  });
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "file") {
      setFormData({ ...formData, [name]: e.target.files[0] });
    } else if (type === "checkbox") {
      // 🔥 Checkbox uchun alohida ishlov
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.movies_preview_url) {
      alert("Iltimos, rasm yuklang yoki URL qo'ying!");
      return;
    }

    if (!formData.movies_url) {
      alert("Iltimos, film manzilini kiriting yoki fayl yuklang!");
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("Token mavjud emas! Iltimos, login qiling.");
      return;
    }

    const data = new FormData();
    data.append("movies_name", formData.movies_name);
    data.append("movies_description", formData.movies_description);
    data.append("movies_url", formData.movies_url);
    data.append("movies_preview_url", formData.movies_preview_url);
    data.append("country", formData.country);
    data.append("count", formData.count);
    data.append("all_series", formData.all_series);
    data.append("created_at", formData.created_at);
    data.append("add_departments", formData.add_departments);
    data.append("year", formData.year);
    data.append("genre", formData.genre);
    data.append("is_possible", formData.is_possible); // 🔥 Yangi field qo'shildi

    try {
      const response = await fetch(`${global_api}/movies/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (response.ok) {
        const newMovie = await response.json(); // Yangi film ma'lumotlarini olish
        alert("Film muvaffaqiyatli qo'shildi!");
        
        // Formani tozalash
        setFormData({
          movies_name: "",
          movies_description: "",
          movies_url: "",
          movies_local: null,
          movies_preview: null,
          movies_preview_url: "",
          country: "",
          count: 0,
          all_series: "",
          created_at: new Date().toISOString(),
          add_departments: "",
          year: "",
          genre: "",
          is_possible: false, // 🔥 Yangi field tozalash
        });
        
        setOpenModal(false);
      
        if (onMovieAdded) {
          onMovieAdded(newMovie);
        }
      } else {
        const errorText = await response.text();
        console.error("Xatolik:", errorText);
        alert("Xatolik: " + errorText);
      }
    } catch (error) {
      console.error("Xatolik:", error);
      alert("Serverda xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button id="add-film" onClick={() => setOpenModal(true)}>
        Film qo'shish
      </button>
      {openModal && (
        <div className="modal-overlay">
          <form onSubmit={handleSubmit} className="update">
            <h2>Film qo'shish</h2>
            <label htmlFor="">Film nomi</label>
            <input
              type="text"
              name="movies_name"
              placeholder="Film nomi"
              value={formData.movies_name}
              onChange={handleChange}
              required
            />
            <label htmlFor="">Film haqida</label>
            <input
              type="text"
              name="movies_description"
              placeholder="Tavsif"
              value={formData.movies_description}
              onChange={handleChange}
              required
            />
            <label htmlFor="">Film manzili (urli)</label>
            <input
              type="text"
              name="movies_url"
              placeholder="Film URL"
              value={formData.movies_url}
              onChange={handleChange}
            />
            <label htmlFor="">Film rasmi (urli)</label>
            <input
              type="text"
              name="movies_preview_url"
              placeholder="Rasm URL"
              value={formData.movies_preview_url}
              onChange={handleChange}
            />
            <label htmlFor="">Davlati</label>
            <input
              type="text"
              name="country"
              placeholder="Davlat"
              value={formData.country}
              onChange={handleChange}
              required
            />
            <label htmlFor="">Ko'rishlar soni</label>
            <input
              type="number"
              name="count"
              placeholder="Ko'rishlar soni"
              value={formData.count}
              onChange={handleChange}
              required
            />
            <label htmlFor="">Yili</label>
            <input
              type="text"
              name="year"
              placeholder="Yil"
              value={formData.year}
              onChange={handleChange}
              required
            />
            <label htmlFor="">Janri</label>
            <input
              type="text"
              name="genre"
              placeholder="Janr"
              value={formData.genre}
              onChange={handleChange}
              required
            />
            <label htmlFor="">Barcha qismlar</label>
            <input
              type="text"
              name="all_series"
              placeholder="Barcha qismlar"
              value={formData.all_series}
              onChange={handleChange}
              required
            />

            <label htmlFor="">Bo'lim</label>
            <select
              name="add_departments"
              value={formData.add_departments}
              onChange={handleChange}
              required
            >
              <option value="">Bo'lim tanlang</option>
              {filmsDepartment.map((dep) => (
                <option key={dep.department_id} value={dep.department_id}>
                  {dep.department_name}
                </option>
              ))}
            </select>
            <div className="checkbox-group">
              <label htmlFor="is_possible" className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_possible"
                  id="is_possible"
                  checked={formData.is_possible}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                O'zbekistonda ko'rinmasin
              </label>
              <small className="checkbox-description">
                Agar belgilansa, bu film O'zbekiston hududida ko'rinmaydi
              </small>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Yuklanmoqda..." : "Film qo'shish"}
            </button>
            <button onClick={() => setOpenModal(false)} type="button">
              Bekor qilish
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AddMovie;