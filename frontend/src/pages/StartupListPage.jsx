import React, { useState, useEffect } from 'react';
import { startupAPI } from '../services/api';
import StartupCard from '../components/StartupCard';
import SearchBar from '../components/SearchBar';

const StartupListPage = () => {
    const [startups, setStartups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStartups = async () => {
            try {
                const data = await startupAPI.getAll();
                setStartups(data);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка загрузки стартапов:', err);
                setLoading(false);
            }
        };

        fetchStartups();
    }, []);

    const handleSearch = async ({ query, filters }) => {
        // Здесь можно добавить фильтрацию
        console.log('Поиск стартапов:', { query, filters });
    };

    if (loading) {
        return <div className="container">Загрузка стартапов...</div>;
    }

    return (
        <div className="container">
            <h1>Все стартапы</h1>
            <SearchBar onSearch={handleSearch} />
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px'}}>
                {startups.map(startup => (
                    <StartupCard key={startup.id} startup={startup} />
                ))}
            </div>
        </div>
    );
};

export default StartupListPage;