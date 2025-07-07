import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import React from 'react'

ChartJS.register(ArcElement, Tooltip, Legend)

interface AverageGradeCardProps {
  average: number | null
  loading?: boolean
}

const AverageGradeCard: React.FC<AverageGradeCardProps> = ({ average, loading }) => (
  <Card sx={{ bgcolor: 'background.paper', color: 'text.primary', boxShadow: 3 }}>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
      <Box sx={{ position: 'relative', width: 80, height: 80, mb: 1 }}>
        <Doughnut
          data={{
            labels: ['Μέσος όρος', 'Υπόλοιπο'],
            datasets: [
              {
                data: [average || 0, Math.max(0, 10 - (average || 0))],
                backgroundColor: ['#1976d2', '#bbdefb'],
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: false,
            cutout: '70%',
            interaction: { mode: 'nearest', intersect: true },
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false }
            },
          }}
          width={80}
          height={80}
        />
        <Typography variant="h5" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 600, color: 'text.primary' }}>
          {loading ? <Skeleton variant="circular" width={24} height={24} /> : (average !== null ? average : '-')}
        </Typography>
      </Box>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
        Συνολικός μέσος όρος
      </Typography>
      <Typography variant="body2" align="center" sx={{ mb: 1, color: 'text.secondary' }}>
        Μέσος όρος από 0 έως 10
      </Typography>
      <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
        Απομένει: {average !== null ? (10 - average).toFixed(2) : '-'} μονάδες για το 10
      </Typography>
    </CardContent>
  </Card>
)

export default AverageGradeCard 