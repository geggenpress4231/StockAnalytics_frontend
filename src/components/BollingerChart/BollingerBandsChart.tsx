import React from 'react';
import { Card, CardContent } from '@mui/material';
import useFetchMovingAverages from '../../hooks/visualisation/useFetchMovingAverages';
import useFetchBollingerBands from '../../hooks/visualisation/useFetchBollingerBands';
import useBollingerBandsChart from '../../hooks/data/useBollingerBandsChart';
import './BollingerBandsChart.scss';

const BollingerBandsChart: React.FC = () => {
    const { data: movingAverages, loading: maLoading, error: maError } = useFetchMovingAverages('IBM', '2024-08-20', '2024-08-22');
    const { data: bollingerBands, loading: bbLoading, error: bbError } = useFetchBollingerBands('IBM', '2024-08-20', '2024-08-22');

    // Combine the moving averages and bollinger bands data
    const combinedData = movingAverages.map(ma => {
        // Use getTime() to compare timestamps in milliseconds
        const bollinger = bollingerBands.find(bb => bb.timestamp.getTime() === ma.timestamp.getTime());
        return {
            ...ma,
            bollinger_upper: bollinger?.bollinger_upper || undefined,
            bollinger_lower: bollinger?.bollinger_lower || undefined,
        };
    });

    useBollingerBandsChart(combinedData, '#bollinger-chart');

    if (maLoading || bbLoading) return <div>Loading...</div>;
    if (maError || bbError) return <div>Error loading data</div>;

    return (
        <div className="bollinger-chart-container">
            <Card>
                <CardContent>
                    <div id="bollinger-chart" className="chart"></div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BollingerBandsChart;
