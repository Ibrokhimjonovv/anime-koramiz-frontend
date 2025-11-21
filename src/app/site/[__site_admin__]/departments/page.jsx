"use client"

import { useState, useEffect } from "react";
import AdminPanel from "../page";
import { global_api } from "../../../_app";
// import defImg from "../../components/header/profile_image.png";
import AddDepartment from "../../../../components/admin-add-department/add-department";
import "../../../../../styles/admin.scss"

const AdminDepartment = () => {
  const [selectedDep, setSelectedDep] = useState(null); // Edit qilinadigan department
  const [editModal, setEditModal] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const [loadingDeps, setLoadingDeps] = useState(true);
  
  const [filmsDepartment, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDeps(true);
      try {
        const response = await fetch(`${global_api}/departments/`);
        if (response.ok) {
          const departments = await response.json();
          setDepartments(departments.data);
        }
      } catch (error) {
        console.error("Filmlarni olishda xato:", error);
      } finally {
        setLoadingDeps(false);
      }
    };
    fetchDepartments();
  }, []);
  const handleEdit = (dep) => {
    setSelectedDep(dep);
    setEditModal(true);
  };

  const handleRequest = async (id, action, updatedData = null) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("Token mavjud emas! Iltimos, login qiling.");
      return;
    }

    // Faqat o‘chirish uchun tasdiqlash oynasini chiqaramiz
    if (action === "delete") {
      const confirmDelete = window.confirm(
        "Haqiqatdan ham ushbu bo‘limni o‘chirmoqchimisiz?"
      );
      if (!confirmDelete) {
        return; // Agar foydalanuvchi rad etsa, funksiyadan chiqamiz
      }
    }

    let options = {
      method: action === "delete" ? "DELETE" : "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    if (action === "update" && updatedData) {
      const formData = new FormData();
      formData.append("department_name", updatedData.department_name);
      if (updatedData.description)
        formData.append("description", updatedData.description);

      if (updatedData.image instanceof File) {
        formData.append("image", updatedData.image);
      }

      options.body = formData;
    }

    try {
      const response = await fetch(`${global_api}/departments/${id}/`, options);

      if (response.ok) {
        if (action === "delete") {
          setDepartments(filmsDepartment.filter((dept) => dept.department_id !== id));
        } else if (action === "update") {
          setDepartments(
            filmsDepartment.map((dept) =>
              dept.department_id === id ? { ...dept, ...updatedData } : dept
            )
          );
          setSelectedDep(null);
        }
      } else {
        const errorText = await response.text();
        console.error("Xatolik:", errorText);
        alert("Xatolik: " + errorText);
      }
    } catch (error) {
      console.error("Xatolik:", error);
      alert("Serverda xatolik yuz berdi!");
    }
  };

  return (
    <div id="admin-users">
      <AdminPanel />
      <AddDepartment />
      {selectedDep && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRequest(selectedDep.department_id, "update", selectedDep);
          }}
          className="update"
        >
          <label htmlFor="">Nomi</label>
          <input
            type="text"
            name="department_name"
            value={selectedDep.department_name}
            onChange={(e) =>
              setSelectedDep({
                ...selectedDep,
                department_name: e.target.value,
              })
            }
            placeholder="Bo'lim nomi"
            required
          />
          <label htmlFor="">Haqida</label>
          <textarea
            name="description"
            value={selectedDep.description}
            onChange={(e) =>
              setSelectedDep({ ...selectedDep, description: e.target.value })
            }
            placeholder="Bo'lim haqida"
            required
          />
          <label htmlFor="Rasmi"></label>
          <input
            type="file"
            name="image"
            onChange={(e) =>
              setSelectedDep({ ...selectedDep, image: e.target.files[0] })
            }
          />
          <button type="submit">
            Bo'limni yangilash
          </button>
          <button type="button" onClick={() => setSelectedDep(null)}>Bekor qilish</button>
        </form>
      )}

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Bo'lim nomi</th>
              <th>Tavsifi</th>
              <th>Rasmi</th>
              <th className="mob">Taxrirlash</th>
              <th className="mob">O'chirish</th>
            </tr>
          </thead>
          <tbody>
            {filmsDepartment.map((dep, index) => (
              <tr key={index}>
                <td>{dep.department_name}</td>
                <td>{dep.description}</td>
                <td>
                  <img src={dep.image} alt="" />
                </td>
                <td className="mob">
                  <button onClick={() => handleEdit(dep)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ionicon"
                      viewBox="0 0 512 512"
                      width={30}
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
                </td>
                <td className="mob">
                  <button onClick={() => handleRequest(dep.department_id, "delete")}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ionicon"
                      viewBox="0 0 512 512"
                      width={30}
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDepartment;
