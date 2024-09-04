import { useState, useEffect } from 'react';

interface MovingAverageData {
    timestamp: Date;
    moving_average_5: number;
    moving_average_10: number;
}

const useFetchMovingAverages = (symbol: string, startDate: string, endDate: string) => {
    const [data, setData] = useState<MovingAverageData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/moving-averages?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}`);
                const fetchedData = await response.json();

                const parsedData = fetchedData.map((d: any) => ({
                    ...d,
                    timestamp: new Date(d.timestamp),
                }));

                setData(parsedData);
            } catch (error) {
                setError('Error fetching moving averages');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, startDate, endDate]);

    return { data, loading, error };
};

export default useFetchMovingAverages;
