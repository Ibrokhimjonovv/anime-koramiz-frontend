"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { global_api } from "../../_app";
import Loading from "../../../components/loading/loading";
import "../../../../styles/admin-panel.scss";

const AdminPanel = () => {
    const router = useRouter();
    const [counts, setCounts] = useState({
        users: 0,
        departments: 0,
        films: 0,
        comments: 0,
        series: 0
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("accessToken");
                const headers = {
                    'Authorization': `Bearer ${token}`
                };

                // Barcha so'rovlarni bir vaqtda amalga oshirish
                const responses = await Promise.all([
                    fetch(`${global_api}/totalUsers/`, { headers }),
                    fetch(`${global_api}/totalDepartments/`, { headers }),
                    fetch(`${global_api}/totalMovies/`, { headers }),
                    fetch(`${global_api}/totalComments/`, { headers }),
                    fetch(`${global_api}/totalSeries/`, { headers })
                ]);

                // Har bir javobni tekshirish
                const data = await Promise.all(responses.map(async (res, i) => {
                    if (!res.ok) {
                        const errorTypes = [
                            "Users", "Departments", "Movies", 
                            "Comments", "Series"
                        ];
                        throw new Error(`Network error (${errorTypes[i]})`);
                    }
                    return await res.json();
                }));

                setCounts({
                    users: data[0].totalUsers || 0,
                    departments: data[1].totalDepartments || 0,
                    films: data[2].totalMovies || 0,
                    comments: data[3].totalComments || 0,
                    series: data[4].totalSeries || 0
                });

            } catch (error) {
                console.error("Fetch error:", error);
                setError(error.message);
                // Agar series so'rovi xato bersa, boshqalarini ko'rsatish
                setCounts(prev => ({
                    ...prev,
                    series: 0
                }));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <div id="admin-header">
            <div id="admin-head">
                <Link href="/" id="to-back">
                    Bosh sahifaga
                </Link>
                <table>
                    <thead>
                        <tr>
                            <th>
                                <Link href="/site/__site_admin__/users/">
                                    <div className="users-count">
                                        <div>Foydalanuvchilar: {counts.users}</div>
                                    </div>
                                </Link>
                            </th>
                            <th>
                                <Link href="/site/__site_admin__/departments/">
                                    <div className="departments-count">
                                        <div>Bo'limlar: <span>{counts.departments}</span></div>
                                    </div>
                                </Link>
                            </th>
                            <th>
                                <Link href="/site/__site_admin__/movies/">
                                    <div className="films-count">
                                        <div>Kinolar: <span>{counts.films}</span></div>
                                    </div>
                                </Link>
                            </th>
                            <th>
                                <Link href="/site/__site_admin__/series/">
                                    <div className="films-count">
                                        <div>Film qismlari: <span>{counts.series}</span></div>
                                    </div>
                                </Link>
                            </th>
                            <th>
                                <Link href="/site/__site_admin__/comments/">
                                    <div className="films-count">
                                        <div>Film izohlari: <span>{counts.comments}</span></div>
                                    </div>
                                </Link>
                            </th>
                            <th>
                                <Link href="/site/__site_admin__/notifications/">
                                    <div className="films-count">
                                        <div>Xabarlar</div>
                                    </div>
                                </Link>
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;