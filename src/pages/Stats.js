import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Cell, LabelList } from 'recharts';
import { db } from '../utils/firebase-config.js';
import { ref, get } from 'firebase/database';
import { Version } from '../App.js';
import { renderLoading } from '../utils/helpFunctions.js';

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
    const cachedChartData = sessionStorage.getItem("chartData");
    const cachedTotal = sessionStorage.getItem("total");
    const cachedSalaries = sessionStorage.getItem("totalSalaries");
    const cachedProfits = sessionStorage.getItem("profits");

    if (cachedChartData && cachedTotal && cachedSalaries && cachedProfits) { // If cached, show it immediately without extracting from firebase
      setChartData(JSON.parse(cachedChartData));
      setTotal(JSON.parse(cachedTotal));
      setTotalSalaries(JSON.parse(cachedSalaries));
      setProfits(JSON.parse(cachedProfits));
      setLoading(false);
      return;
    }

    const fetchExpenses = async () => {
      try {
        setLoading(true);
        // Get reference to the expenses in the data base
        const expensesRef = ref(db, 'expenses');
        const snapshot = await get(expensesRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const categoryTotals = {};
          let grandTotal = 0;

          // Iterate over subcategories and calc the amount for each category, in addition calc the total amount
          for (const category in data) {
            const subcategories = data[category];
            let categorySum = 0;

            for (const subcategory in subcategories) {
              const amount = subcategories[subcategory]?.amount ?? 0;
              categorySum += parseFloat(amount) || 0;
            }

            categoryTotals[category] = (categoryTotals[category] || 0) + categorySum;
            grandTotal += categorySum;
          }

          // Convert to recharts format
          const formattedData = Object.entries(categoryTotals).map(([category, amount]) => ({
            name: category,
            amount: parseFloat(amount.toFixed(2)),
            subcategories: Object.entries(data[category]).map(([sub, obj]) => ({
              name: sub,
              amount: parseFloat(obj?.amount ?? 0)
            }))
          }));

          setChartData(formattedData);
          setTotal(grandTotal.toFixed(2));

          const salariesRef = ref(db, 'Salaries');
          const salariesSnap = await get(salariesRef);
          let salariesTotal = 0;
          if (salariesSnap.exists()) {
            const salaries = salariesSnap.val();
            salariesTotal = Object.values(salaries).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
          }
          setTotalSalaries(salariesTotal.toFixed(2));
          // Calculate profits
          setProfits((salariesTotal - grandTotal).toFixed(2));
          
          sessionStorage.setItem("chartData", JSON.stringify(formattedData));
          sessionStorage.setItem("total", JSON.stringify(grandTotal.toFixed(2)));
          sessionStorage.setItem("totalSalaries", JSON.stringify(salariesTotal.toFixed(2)));
          sessionStorage.setItem("profits", JSON.stringify((salariesTotal - grandTotal).toFixed(2)));
        } else {
          setChartData([]);
          setTotal(0);
        }
      } catch (err) {
        console.error('Error fetching expenses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
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

  if (loading) return renderLoading("Loading...");
  if (chartData.length === 0) return <p>No expense data available.</p>;


  return (
    <div>
      <h1>Overview</h1>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="40%">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} angle={-20} textAnchor="end"/>
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" fill="#0088FE">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList dataKey="amount" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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
