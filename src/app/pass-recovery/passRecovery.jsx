"use client"

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";
import { global_api } from '../_app';
import "../../../styles/passRecovery.scss";

export default function PasswordReset() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [showPass, setShowPass] = useState(false);


    // Step 1: Request reset code
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${global_api}/password-reset/request/`, {
                email
            });

            if (response.status === 200) {
                setStep(2); // Move to verification step
                setSuccess('Verification code sent to your email.');
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Bu email bilan ro'yxatdan o'tgan foydalanuvchi topilmadi.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify code
    const handleTokenSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${global_api}/password-reset/verify/`, {
                email,
                token
            });

            if (response.status === 200) {
                setStep(3); // Move to password reset step
                setSuccess('Code verified. Please set your new password.');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Kod yaroqsiz yoki muddati oʻtgan.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Parollar mos emas.");
            setLoading(false);
            return;
        }
        if (!newPassword || confirmPassword.length < 6) {
            setError("Parol 6 ta belgidan kam bo'lmasligi kerak.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${global_api}/password-reset/confirm/`, {
                email,
                token,
                new_password: newPassword,
                confirm_password: confirmPassword
            });

            if (response.status === 200) {
                setSuccess('Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const [timeLeft, setTimeLeft] = useState(300); // 5 daqiqa = 300 soniya

    // Vaqtni hisoblash uchun useEffect
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    // Kodni qayta yuborish funksiyasi
    const handleResendCode = async () => {
        try {
            setLoading(true);
            // Bu yerda backendga qayta kod yuborish so'rovini yuboramiz
            await axios.post('/password-reset/request/', { email });
            setTimeLeft(300); // Taymerni qayta 5 daqiqaga qo'yamiz
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Kodni qayta yuborishda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="pass-recovery">
            <div className="password-reset-container">
                {/* <div className="progress-steps">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>
                        <p>Email adresni kiriting</p>
                    </div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                        <p>Kodni tasdiqlash</p>
                    </div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>
                        <p>Yangi parol</p>
                    </div>
                </div> */}

                {/* {success && <div className="alert success">{success}</div>} */}

                {/* Step 1: Email Input */}
                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="reset-form">
                        <h2>Parolingizni qayta tiklash</h2>
                        <p className="repass-p">Parolni tiklamoqchi bo'lgan email manzilingizni kiriting unga kod yuboramiz</p>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Ro'yxatdan o'tgan email manzilni kiriting"
                        />
                        {error && <div className="alert error">{error}</div>}

                        <button type="submit" disabled={loading}>
                            {loading ? 'Yuborilmoqda...' : 'Tasdiqlash kodini yuborish'}
                        </button>
                    </form>
                )}

                {/* Step 2: Code Verification */}
                {step === 2 && (
                    <form onSubmit={handleTokenSubmit} className="reset-form sec">
                        <h2>Parolni tasdiqlang</h2>
                        <p className="repass-p"><span>{email}</span> email manziliga 6 xonalik kod yubordik</p>
                        <p className='repass-p oth'>Agar biz yuborgan xabarni topa olmasangiz <span>"Spam"</span> bo'limiga qarab ko'ring!</p>

                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            maxLength={6}
                            required
                            placeholder="6 xonalik kodni kiriting"
                        />


                        <div className="timer-section" style={{ marginTop: "15px" }}>
                            {timeLeft > 0 ? (
                                <p className="timer-text">
                                    Kodni qayta yuborish uchun: {Math.floor(timeLeft / 60)} daqiqa {timeLeft % 60} soniya
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    className="resend-button"
                                    onClick={handleResendCode}
                                >
                                    Kodni qayta yuborish
                                </button>
                            )}
                        </div>
                        {error && <div className="alert error ">{error}</div>}

                        <div className="form-actions">
                            <button
                                type="button"
                                className="secondary"
                                onClick={() => setStep(1)}
                            >
                                Orqaga
                            </button>
                            <button type="submit" disabled={loading}>
                                {loading ? 'Tasdiqlanmoqda...' : 'Kodni tasdiqlash'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handlePasswordSubmit} className="reset-form">
                        <h2>Yangi parolni kiriting</h2>
                        <p className="repass-p">Shaxsiy akkountingiz uchun yangi parolni kiriting</p>

                        <div id="pss">
                            <input
                                type={`${showPass ? "text" : "password"}`}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="Yangi parolni kiriting"
                            />
                            <button
                                id="eye"
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                            >
                                {showPass ? (
                                    <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="ionicon"
                                            viewBox="0 0 512 512"
                                        >
                                            <path d="M432 448a15.92 15.92 0 01-11.31-4.69l-352-352a16 16 0 0122.62-22.62l352 352A16 16 0 01432 448zM255.66 384c-41.49 0-81.5-12.28-118.92-36.5-34.07-22-64.74-53.51-88.7-91v-.08c19.94-28.57 41.78-52.73 65.24-72.21a2 2 0 00.14-2.94L93.5 161.38a2 2 0 00-2.71-.12c-24.92 21-48.05 46.76-69.08 76.92a31.92 31.92 0 00-.64 35.54c26.41 41.33 60.4 76.14 98.28 100.65C162 402 207.9 416 255.66 416a239.13 239.13 0 0075.8-12.58 2 2 0 00.77-3.31l-21.58-21.58a4 4 0 00-3.83-1 204.8 204.8 0 01-51.16 6.47zM490.84 238.6c-26.46-40.92-60.79-75.68-99.27-100.53C349 110.55 302 96 255.66 96a227.34 227.34 0 00-74.89 12.83 2 2 0 00-.75 3.31l21.55 21.55a4 4 0 003.88 1 192.82 192.82 0 0150.21-6.69c40.69 0 80.58 12.43 118.55 37 34.71 22.4 65.74 53.88 89.76 91a.13.13 0 010 .16 310.72 310.72 0 01-64.12 72.73 2 2 0 00-.15 2.95l19.9 19.89a2 2 0 002.7.13 343.49 343.49 0 0068.64-78.48 32.2 32.2 0 00-.1-34.78z" />
                                            <path d="M256 160a95.88 95.88 0 00-21.37 2.4 2 2 0 00-1 3.38l112.59 112.56a2 2 0 003.38-1A96 96 0 00256 160zM165.78 233.66a2 2 0 00-3.38 1 96 96 0 00115 115 2 2 0 001-3.38z" />
                                        </svg>
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="ionicon"
                                            viewBox="0 0 512 512"
                                        >
                                            <path
                                                d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeinejoin="round"
                                                strokeWidth="32"
                                            />
                                            <circle
                                                cx="256"
                                                cy="256"
                                                r="80"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeMiterlimit="10"
                                                strokeWidth="32"
                                            />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>

                        <input
                            type={`${showPass ? "text" : "password"}`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Yangi parolni tasdiqlang"
                        />
                        {error && <div className="alert error ">{error}</div>}


                        <div className="form-actions">
                            <button
                                type="button"
                                className="secondary"
                                onClick={() => setStep(2)}
                            >
                                Ortga
                            </button>
                            <button type="submit" disabled={loading}>
                                {loading ? 'Tiklanmoqda...' : 'Parolni tiklash'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
}