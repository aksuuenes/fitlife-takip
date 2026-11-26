import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Ana sayfadaki kilo grafiği. recharts büyük olduğu için ayrı dosyada, ihtiyaç olunca yüklenir.
export default function WeightChart({ chartData, theme }: { chartData: any[]; theme: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f8fafc'} />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontWeight: '700', textTransform: 'uppercase'}} 
        />
        <YAxis hide={true} domain={['dataMin - 3', 'dataMax + 3']} />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '16px', 
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #f1f5f9', 
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', 
            fontSize: '13px', 
            fontFamily: 'Plus Jakarta Sans', 
            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff'
          }}
          labelStyle={{ fontWeight: 'bold', color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
          itemStyle={{ color: theme === 'dark' ? '#94a3b8' : '#0f172a' }}
        />
        <Area 
          type="monotone" 
          dataKey="weight" 
          stroke="#4f46e5" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorWeight)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
