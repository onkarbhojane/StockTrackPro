import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

const Histogram = () => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null); // Ref to store the chart instance

    useEffect(() => {
        const data = [
            { year: 2010, count: 10 },
            { year: 2011, count: 20 },
            { year: 2012, count: 15 },
            { year: 2013, count: 25 },
            { year: 2014, count: 22 },
            { year: 2015, count: 30 },
            { year: 2016, count: 28 },
        ];

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext("2d");

        chartInstanceRef.current = new Chart(ctx, {
            type: "bar",
            data: {
                labels: data.map((row) => row.count),
                datasets: [
                    {
                        label: "Acquisitions by Year",
                        data: data.map((row) => row.year),
                        backgroundColor: "rgba(246, 74, 6, 0.2)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top",
                    },
                    title: {
                        display: true,
                        text: "Acquisitions Over the Years",
                    },
                },
            },
        });

        // Cleanup on unmount
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, []);

    return (
        <div>
            <h1>Histogram</h1>
            <canvas ref={chartRef} id="acquisitions" width="400" height="400"></canvas>
        </div>
    );
};

export default Histogram;
