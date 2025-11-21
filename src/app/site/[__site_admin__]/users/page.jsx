"use client"

import { useEffect, useState } from "react";
import "../../../../../styles/admin.scss";
import AdminPanel from "../page";
import { global_api } from "../../../_app";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };


    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const fetchUsers = await fetch(`${global_api}/users/`);
                if (!fetchUsers.ok) {
                    throw new Error("Tarmoq xatosi (Users)");
                } else {
                    const data = await fetchUsers.json();
                    setUsers(data);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []); // faqat komponent yuklanganda ishga tushadi

    const SecureImage = ({ src, alt }) => {
        const [imageUrl, setImageUrl] = useState('/assets/pf-logo.png');

        useEffect(() => {
            let objectUrl;

            const fetchImage = async () => {
                try {
                    // Agar rasm manzili bo'lmasa, default rasmni ishlatamiz
                    if (!src) {
                        setImageUrl('/assets/pf-logo.png');
                        return;
                    }

                    // Rasmni fetch qilamiz
                    const response = await fetch(src);

                    if (!response.ok) throw new Error('Rasm yuklab olinmadi');

                    // Blob qilib olamiz
                    const blob = await response.blob();
                    objectUrl = URL.createObjectURL(blob);
                    console.log(objectUrl);

                    setImageUrl(objectUrl);
                } catch (error) {
                    console.error('Rasm yuklashda xato:', error);
                    setImageUrl('/assets/pf-logo.png');
                }
            };

            fetchImage();

            // Tozalash funktsiyasi
            return () => {
                if (objectUrl) {
                    URL.revokeObjectURL(objectUrl);
                }
            };
        }, [src]);

        return <img src={imageUrl} alt={alt} />;
    };

    return (
        <div id="admin-users">
            <AdminPanel />
            <div className="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ismi</th>
                            <th>Familiyasi</th>
                            <th>Foydalanuvchi nomi</th>
                            <th className="desktop-mode">Email</th>
                            <th className="desktop-mode">Profil rasmi</th>
                            <th className="desktop-mode">Ro'yxatdan o'tgan sanasi</th>
                            <th className="desktop-mode">So'ngi aktivligi</th>
                            <th className="desktop-mode">Holati</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index}>
                                <td>{index+1}</td>
                                <td>{user.first_name}</td>
                                <td>{user.last_name}</td>
                                <td>{user.username}</td>
                                <td className="desktop-mode">{user.email}</td>
                                <td className="desktop-mode">
                                    <SecureImage src={user?.profile_image} alt="Profile" />
                                </td>
                                <td className="desktop-mode">{formatDate(user.date_joined)}</td>
                                <td className="desktop-mode">{formatDate(user.last_login)}</td>
                                <td className="desktop-mode">{user.is_superuser ? "Admin" : "User"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
