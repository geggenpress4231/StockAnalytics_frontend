import { useState, useEffect } from 'react';

interface IndicatorData {
    timestamp: Date;
    rsi: number;
    macd: number;
}

const useFetchIndicators = (symbol: string, startDate: string, endDate: string) => {
    const [data, setData] = useState<IndicatorData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/indicators?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}`);
                const fetchedData = await response.json();

                const parsedData = fetchedData.map((d: any) => ({
                    ...d,
                    timestamp: new Date(d.timestamp),
                }));

                setData(parsedData);
            } catch (error) {
                setError('Error fetching indicators');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, startDate, endDate]);

    return { data, loading, error };
};

export default useFetchIndicators;
