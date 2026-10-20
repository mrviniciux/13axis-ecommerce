'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const data = [
  { month: 'Mai', sales: 28400 },
  { month: 'Jun', sales: 31900 },
  { month: 'Jul', sales: 29800 },
  { month: 'Ago', sales: 38700 },
  { month: 'Set', sales: 35400 },
  { month: 'Out', sales: 42600 },
  { month: 'Nov', sales: 39700 },
  { month: 'Dez', sales: 51200 },
  { month: 'Jan', sales: 46800 },
  { month: 'Fev', sales: 53900 },
  { month: 'Mar', sales: 49600 },
  { month: 'Abr', sales: 62400 },
];

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export default function SalesChart() {
  return (
    <div
      className="h-[270px] w-full"
      aria-label="Gráfico demonstrativo de vendas"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4c8d74" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#4c8d74" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#e8ece8"
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8b9590', fontSize: 11 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8b9590', fontSize: 11 }}
            tickFormatter={(value: number) => `${value / 1000}k`}
            width={35}
          />
          <Tooltip
            cursor={{ stroke: '#8aa99a', strokeDasharray: '4 4' }}
            contentStyle={{
              border: '1px solid #e2e7e2',
              borderRadius: 4,
              fontSize: 12,
            }}
            formatter={(value) => [currency.format(Number(value)), 'Vendas']}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#39715d"
            strokeWidth={2.5}
            fill="url(#salesFill)"
            activeDot={{
              r: 4,
              fill: '#39715d',
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
