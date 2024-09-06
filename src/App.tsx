import React from 'react';
import LineChart from './components/LineChart/LineChart';
import './App.scss'; 
import './shared-style.scss';
import BollingerBandsChart from './components/BollingerChart/BollingerBandsChart';

const App: React.FC = () => {
    return (
        <main className="app-container" aria-label="Data visualization area" role="main">
            {/* Line Chart Section */}
            <section aria-labelledby="line-chart-heading" role="region" tabIndex={0}>
                <h2 id="line-chart-heading" className="visually-hidden">Stock Prices - Line Chart</h2>
                <LineChart />
            </section>

            {/* Bollinger Bands Chart Section */}
            <section aria-labelledby="bollinger-chart-heading" role="region" tabIndex={0}>
                <h2 id="bollinger-chart-heading" className="visually-hidden">Bollinger Bands Chart</h2>
                <BollingerBandsChart />
            </section>
        </main>
    );
}

export default App;
