"use client";

import React, { useState, useContext } from 'react';
import Modal from 'react-modal';
import { useRouter } from 'next/navigation'; // next/router emas
import "./logout.scss";
import Loading from '../loading/loading';

// Modal uchun elementni topishni tekshirish
if (typeof window !== 'undefined') {
  Modal.setAppElement('#__next') || Modal.setAppElement('body');
}

const Logout = () => {
  const router = useRouter();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button id='logout' onClick={openModal}>
        Chiqish
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Logout Confirmation"
        className="modal"
        overlayClassName="overlay"
        shouldCloseOnOverlayClick={true}
      >
        <h2 style={{textAlign: 'center'}}>Xisobdan chiqmoqchimisiz?</h2>
        <div className="modal-buttons">
          <button onClick={handleLogout} disabled={loading}>
            {loading ? <Loading size="small" /> : 'Ha'}
          </button>
          <button onClick={closeModal} disabled={loading}>Yo'q</button>
        </div>
      </Modal>
    </div>
  );
};

export default Logout;