"use client"

import { useState } from "react";
import { global_api } from "../../app/_app";
import "./add-department.scss";

export default function AddDepartment() {
  const [department, setDepartment] = useState({
    department_name: "",
    image: null,
    description: "",
  });

  const [loading, setLoading] = useState(false); // ✅ Loading holati qo'shildi

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setDepartment((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ Loading boshlanadi
    const formData = new FormData();
    formData.append("department_name", department.department_name);
    formData.append("description", department.description);
    if (department.image) {
      // ✅ Rasm mavjudligini tekshiramiz
      formData.append("image", department.image);
    }

    try {
      const token = localStorage.getItem("accessToken"); // Token olish

      const response = await fetch(`${global_api}/departments/`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Bearer formatida tokenni yuborish
        },
      });

      if (response.ok) {
        alert("Muvaffaqiyatli qo'shildi!");
        setDepartment({ department_name: "", image: null, description: "" });
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error("Response Error:", errorText);
        alert("Failed to add department: " + errorText);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false); // ✅ Loading tugaydi
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-department">
      <label htmlFor="">Nomi</label>
      <input
        type="text"
        name="department_name"
        value={department.department_name}
        onChange={handleChange}
        placeholder="Bo'lim nomi"
        required
      />
      <label htmlFor="">Rasmi</label>
      <input type="file" name="image" onChange={handleFileChange} />
      <label htmlFor="">Haqida</label>
      <textarea
        name="description"
        value={department.description}
        onChange={handleChange}
        placeholder="Bo'lim haqida"
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Yuklanmoqda..." : "Bo'lim qo'shish"}
      </button>
    </form>
  );
}
