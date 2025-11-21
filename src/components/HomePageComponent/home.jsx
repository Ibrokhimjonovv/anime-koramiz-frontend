'use client'
import React from 'react'
import FilmsContainer from '../films-container/films-container';
import Departments from '../departments/departments';
import Donate from '../for-donate/layout';
import Films from '../films/films';

const Home = () => {
    return (
        <section className="home-section">
            <FilmsContainer />
            <Departments />
            <Donate />
            <Films />
        </section>
    )
}

export default Home