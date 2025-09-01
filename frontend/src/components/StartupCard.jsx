import React from 'react';
import { Link } from 'react-router-dom';

const StartupCard = ({ startup }) => {
    const getStageColor = (stage) => {
        switch(stage) {
            case 'idea': return '#ffc107';
            case 'prototype': return '#17a2b8';
            case 'pre_launch': return '#fd7e14';
            case 'launch': return '#28a745';
            case 'growth': return '#6f42c1';
            default: return '#6c757d';
        }
    };

    return (
        <div className="startup-card">
            <h3>{startup.name}</h3>
            <p>{startup.description}</p>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px'}}>
                <span className="stage" style={{backgroundColor: getStageColor(startup.stage)}}>
                    {startup.stage}
                </span>
                <span>{startup.industry}</span>
                {startup.funding_requested && (
                    <span>💰 {startup.funding_requested} ₽</span>
                )}
            </div>
            <div style={{marginTop: '15px'}}>
                <Link to={`/startup/${startup.id}`} className="btn btn-primary">
                    Подробнее
                </Link>
            </div>
        </div>
    );
};

export default StartupCard;