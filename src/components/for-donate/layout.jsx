import React from 'react';
import "./layout.scss";
import Link from 'next/link';

const Donate = () => {
  return (
    <div className='donate-container'>
        <h2>Animelarni <span>zavq</span> bilan, <span>qotishlarsiz</span> va <span>bepul</span> tomosha qiling :<span>)</span></h2>
        <h3>Bir oz reklamalar mavjud - filmlarni mazza qilib tomosha qilish uchun reklamalar bilan jang qiling <img src="/assets/hand-heart.png" alt="" /></h3>
        <Link target='_blank' href="https://tirikchilik.uz/afdplatform">Donat orqali qo'llab quvvatlash</Link>
    </div>
  )
}

export default Donate