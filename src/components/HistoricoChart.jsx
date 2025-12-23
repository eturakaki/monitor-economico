import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function HistoricoChart({ datos, color = "#10b981" }) {
  // Si no hay datos, mostramos un aviso elegante
  if (!datos || datos.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-100 text-gray-400">
        <p>Sin datos históricos disponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={datos} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGradiente" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          
          <XAxis 
            dataKey="fecha" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            dy={10}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            domain={['auto', 'auto']} // Escala automática
          />
          
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          
          <Area 
            type="monotone"  //Ver linear
            dataKey="valor" 
            stroke={color} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorGradiente)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}