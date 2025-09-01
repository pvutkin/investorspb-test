import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({
        industry: '',
        stage: '',
        type: ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch({ query, filters });
    };

    return (
        <div className="search-bar">
            <form onSubmit={handleSearch}>
                <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="form-control"
                        style={{flex: 1}}
                    />
                    <button type="submit" className="btn btn-primary">Найти</button>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                    <select
                        value={filters.industry}
                        onChange={(e) => setFilters({...filters, industry: e.target.value})}
                        className="form-control"
                    >
                        <option value="">Все направления</option>
                        <option value="Tech">Tech</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                    </select>
                    <select
                        value={filters.stage}
                        onChange={(e) => setFilters({...filters, stage: e.target.value})}
                        className="form-control"
                    >
                        <option value="">Все стадии</option>
                        <option value="idea">Идея</option>
                        <option value="prototype">Прототип</option>
                        <option value="pre_launch">Предзапуск</option>
                        <option value="launch">Запуск</option>
                        <option value="growth">Рост</option>
                    </select>
                </div>
            </form>
        </div>
    );
};

export default SearchBar;