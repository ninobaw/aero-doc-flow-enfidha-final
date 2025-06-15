import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Mail } from 'lucide-react';
import { PRIORITIES } from '@/shared/constants';

interface CorrespondencePriorityDistributionProps {
  data: { name: string; value: number }[];
  isLoading: boolean;
}

const COLORS = {
  LOW: '#6B7280', // gray-500
  MEDIUM: '#F59E0B', // amber-500
  HIGH: '#EF4444', // red-500
  URGENT: '#DC2626', // red-600
};

export const CorrespondencePriorityDistribution: React.FC<CorrespondencePriorityDistributionProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map(item => ({
    name: PRIORITIES[item.name as keyof typeof PRIORITIES]?.label || item.name,
    value: item.value,
    color: COLORS[item.name as keyof typeof COLORS] || '#6B7280',
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="w-5 h-5 mr-2 text-aviation-sky" />
          Correspondances par Priorité
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="name" className="text-sm text-gray-600" />
            <YAxis allowDecimals={false} className="text-sm text-gray-600" />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
            <Bar dataKey="value" fill="#0EA5E9">
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};