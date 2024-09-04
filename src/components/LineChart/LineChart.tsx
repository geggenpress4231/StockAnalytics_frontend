import React from 'react';
import { Card, CardContent } from '@mui/material';
import useFetchStockData from '../../hooks/visualisation/useFetchStockData'; 
import useLineChart from '../../hooks/data/useLineChart'; 
import './LineChart.scss';

const LineChart: React.FC = () => {
    const { data, loading, error } = useFetchStockData('IBM', '2024-08-20', '2024-08-22');
    
    useLineChart(data, '#chart'); 

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="chart-container"> 
            <Card>
                <CardContent>
                    <div id="chart" className="chart"></div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LineChart;
