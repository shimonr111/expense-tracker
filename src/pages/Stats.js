import React, { useEffect, useState } from 'react';
import { Version } from '../App.js';
import { getStatsData } from '../services/statsService.js';
import { renderSmallLoading } from '../utils/helpFunctions.js';
import { getSessionCache, setSessionCache } from "../utils/cache.js";
import { StatsChart } from '../ui/StatsChart.jsx';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA46BE', '#FF5F7E'];

const Stats = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalSalaries, setTotalSalaries] = useState(0);
  const [profits, setProfits] = useState(0);

  // Implemented in the background - right after the page is loaded
  useEffect(() => {
    // Reads a cached value (if exist) from earlier visit in the same session
    const cached = getSessionCache("statsData");
    if (cached) {
      setChartData(cached.formattedData);
      setTotal(cached.grandTotal);
      setTotalSalaries(cached.totalSalaries);
      setProfits(cached.profits);
      return;
    }

    const fetchExpensesFromDb = async () => {

        setLoading(true);
        const data = await getStatsData();
        const normalizedData = {
            formattedData: data.formattedData,
            grandTotal: data.grandTotal.toFixed(2),
            totalSalaries: data.salariesTotal.toFixed(2),
            profits: (data.salariesTotal - data.grandTotal).toFixed(2)
        };
        setChartData(normalizedData.formattedData);
        setTotal(normalizedData.grandTotal);
        setTotalSalaries(normalizedData.totalSalaries);
        setProfits(normalizedData.profits);
        setSessionCache("statsData", normalizedData);
        setLoading(false);
      };

      fetchExpensesFromDb();
    }, []);

  const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, subcategories } = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p><u><strong>{name}</strong></u></p>
        {subcategories && subcategories.length > 0 ? (
          subcategories.map((sub, idx) => (
            <p key={idx}>
              {sub.name}: {sub.amount}
            </p>
          ))
        ) : (
          <p>No subcategories</p>
        )}
      </div>
    );
  }
    return null;
  };

  if (loading) return renderSmallLoading("Loading...");
  if (chartData.length === 0) return <p>No expense data available.</p>;


  return (
    <div className="page-container">
      <h1>Overview</h1>
      <StatsChart data={chartData} colors={COLORS} CustomTooltip={CustomTooltip} />
      <p className="total-expenses">
        Total Expenses: <span className="amount">{total}</span>
      </p>
      <p className="total-salaries">
        Total Salaries: <span className="amount">{totalSalaries}</span>
      </p>
      <p className="profits">
        Profits: <span className="amount" style={{ color: profits >= 0 ? 'green' : 'red' }}>{profits}</span>
      </p>
      <div id="version-label">{Version}</div>
    </div>
  );
};

export default Stats;
