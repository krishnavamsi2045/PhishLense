import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const apiBase =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export default function AnalyticsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${apiBase}/analytics`)
      .then((res) => res.json())
      .then((res) => {
        const chartData = res.labels.map(
          (label, index) => ({
            name: label,
            value: res.values[index],
          })
        );

        setData(chartData);
      });
  }, []);

  const COLORS = [
    "#ff4d4f",
    "#faad14",
    "#52c41a",
  ];

  return (
    <div className="analytics-card">
      <h2>Threat Distribution</h2>

      <ResponsiveContainer
        width="100%"
        height={350}
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={120}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
              />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}