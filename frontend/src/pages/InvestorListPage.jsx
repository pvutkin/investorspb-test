import React, { useState, useEffect } from 'react';
import { investorAPI } from '../services/api';
import InvestorCard from '../components/InvestorCard';
import SearchBar from '../components/SearchBar';

const InvestorListPage = () => {
    const [investors, setInvestors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvestors = async () => {
            try {
                const data = await investorAPI.getAll();
                setInvestors(data);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка загрузки инвесторов:', err);
                setLoading(false);
            }
        };

        fetchInvestors();
    }, []);

    const handleSearch = async ({ query, filters }) => {
        // Здесь можно добавить фильтрацию
        console.log('Поиск инвесторов:', { query, filters });
    };

    if (loading) {
        return <div className="container">Загрузка инвесторов...</div>;
    }

    return (
        <div className="container">
            <h1>Все инвесторы</h1>
            <SearchBar onSearch={handleSearch} />
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px'}}>
                {investors.map(investor => (
                    <InvestorCard key={investor.id} investor={investor} />
                ))}
            </div>
        </div>
    );
};

export default InvestorListPage;