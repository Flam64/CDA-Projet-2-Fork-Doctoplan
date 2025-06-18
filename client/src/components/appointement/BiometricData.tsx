import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface BiometricData {
  date: string;
  value: number;
  unit: string;
}

interface BiometricDataset {
  label: string;
  data: BiometricData[];
  color: string;
}

type BiometricType = 'arterial' | 'temperature' | 'respiratory' | 'imc';

export default function BiometricDataComponent() {
  const [activeTab, setActiveTab] = useState<BiometricType>('arterial');

  const biometricData: Record<BiometricType, BiometricDataset[]> = {
    arterial: [
      {
        label: 'Pression Systolique',
        color: '#3B82F6',
        data: [
          { date: 'Jan', value: 135, unit: 'mmHg' },
          { date: 'Fév', value: 128, unit: 'mmHg' },
          { date: 'Mar', value: 142, unit: 'mmHg' },
          { date: 'Avr', value: 138, unit: 'mmHg' },
          { date: 'Mai', value: 145, unit: 'mmHg' },
          { date: 'Jun', value: 140, unit: 'mmHg' },
          { date: 'Jul', value: 135, unit: 'mmHg' },
          { date: 'Aoû', value: 132, unit: 'mmHg' },
          { date: 'Sep', value: 139, unit: 'mmHg' },
          { date: 'Oct', value: 144, unit: 'mmHg' },
          { date: 'Nov', value: 137, unit: 'mmHg' },
          { date: 'Déc', value: 141, unit: 'mmHg' },
        ],
      },
      {
        label: 'Pression Diastolique',
        color: '#10B981',
        data: [
          { date: 'Jan', value: 85, unit: 'mmHg' },
          { date: 'Fév', value: 82, unit: 'mmHg' },
          { date: 'Mar', value: 88, unit: 'mmHg' },
          { date: 'Avr', value: 86, unit: 'mmHg' },
          { date: 'Mai', value: 90, unit: 'mmHg' },
          { date: 'Jun', value: 87, unit: 'mmHg' },
          { date: 'Jul', value: 84, unit: 'mmHg' },
          { date: 'Aoû', value: 83, unit: 'mmHg' },
          { date: 'Sep', value: 86, unit: 'mmHg' },
          { date: 'Oct', value: 89, unit: 'mmHg' },
          { date: 'Nov', value: 85, unit: 'mmHg' },
          { date: 'Déc', value: 88, unit: 'mmHg' },
        ],
      },
    ],
    temperature: [
      {
        label: 'Température corporelle',
        color: '#EF4444',
        data: [
          { date: 'Jan', value: 36.5, unit: '°C' },
          { date: 'Fév', value: 36.8, unit: '°C' },
          { date: 'Mar', value: 37.2, unit: '°C' },
          { date: 'Avr', value: 36.9, unit: '°C' },
          { date: 'Mai', value: 36.7, unit: '°C' },
          { date: 'Jun', value: 36.6, unit: '°C' },
          { date: 'Jul', value: 36.8, unit: '°C' },
          { date: 'Aoû', value: 36.9, unit: '°C' },
          { date: 'Sep', value: 37.0, unit: '°C' },
          { date: 'Oct', value: 36.8, unit: '°C' },
          { date: 'Nov', value: 36.7, unit: '°C' },
          { date: 'Déc', value: 36.6, unit: '°C' },
        ],
      },
    ],
    respiratory: [
      {
        label: 'Fréquence respiratoire',
        color: '#8B5CF6',
        data: [
          { date: 'Jan', value: 16, unit: '/min' },
          { date: 'Fév', value: 18, unit: '/min' },
          { date: 'Mar', value: 15, unit: '/min' },
          { date: 'Avr', value: 17, unit: '/min' },
          { date: 'Mai', value: 19, unit: '/min' },
          { date: 'Jun', value: 16, unit: '/min' },
          { date: 'Jul', value: 18, unit: '/min' },
          { date: 'Aoû', value: 17, unit: '/min' },
          { date: 'Sep', value: 16, unit: '/min' },
          { date: 'Oct', value: 18, unit: '/min' },
          { date: 'Nov', value: 17, unit: '/min' },
          { date: 'Déc', value: 16, unit: '/min' },
        ],
      },
    ],
    imc: [
      {
        label: 'IMC',
        color: '#F59E0B',
        data: [
          { date: 'Jan', value: 24.5, unit: 'kg/m²' },
          { date: 'Fév', value: 24.8, unit: 'kg/m²' },
          { date: 'Mar', value: 25.1, unit: 'kg/m²' },
          { date: 'Avr', value: 24.9, unit: 'kg/m²' },
          { date: 'Mai', value: 25.0, unit: 'kg/m²' },
          { date: 'Jun', value: 24.7, unit: 'kg/m²' },
          { date: 'Jul', value: 24.6, unit: 'kg/m²' },
          { date: 'Aoû', value: 24.8, unit: 'kg/m²' },
          { date: 'Sep', value: 25.2, unit: 'kg/m²' },
          { date: 'Oct', value: 25.0, unit: 'kg/m²' },
          { date: 'Nov', value: 24.9, unit: 'kg/m²' },
          { date: 'Déc', value: 24.7, unit: 'kg/m²' },
        ],
      },
    ],
  };

  const tabs = [
    { id: 'arterial', label: 'Pression artérielle', active: true },
    { id: 'temperature', label: 'Température', active: false },
    { id: 'respiratory', label: 'Fréquence respiratoire', active: false },
    { id: 'imc', label: 'IMC', active: false },
  ];

  const prepareChartData = (datasets: BiometricDataset[]) => {
    const labels = datasets[0].data.map(item => item.date);

    return {
      labels,
      datasets: datasets.map(dataset => ({
        label: dataset.label,
        data: dataset.data.map(item => item.value),
        borderColor: dataset.color,
        backgroundColor: dataset.color + '20',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      })),
    };
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (context) {
            const dataset = biometricData[activeTab][context.datasetIndex];
            const unit = dataset.data[0].unit;
            return `${context.dataset.label}: ${context.parsed.y} ${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Période',
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: biometricData[activeTab][0].data[0].unit,
        },
        grid: {
          color: '#E5E7EB',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const chartData = prepareChartData(biometricData[activeTab]);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Données biométriques</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as BiometricType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05 * tabs.indexOf(tab) }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-6">
          {/* Add a button to add a new measure but it's not implemented yet and will be done later in a other pr */}
          {/*
          <motion.button
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05, backgroundColor: '#2563eb' }}
            whileTap={{ scale: 0.97 }}
          >
            <span>+</span>
            Ajouter une mesure
          </motion.button>
        */}
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="h-80 w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <Line data={chartData} options={chartOptions} />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
