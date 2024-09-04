import React from 'react';
import LineChart from './components/LineChart/LineChart';
import './App.scss'; 
import './shared-style.scss'
import BollingerBandsChart from './components/BollingerChart/BollingerBandsChart';

const App: React.FC = () => {
    return (
        <div className="app-container">
            <LineChart />
            <BollingerBandsChart/>
        </div>
    );
}

export default App;
