import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList } from 'recharts';

export const StatsChart = ({ data, colors, CustomTooltip }) => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="40%">
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} angle={-20} textAnchor="end" />
      <YAxis />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="amount" fill="#0088FE">
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
        <LabelList dataKey="amount" position="top" />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);
