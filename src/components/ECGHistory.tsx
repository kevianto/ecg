import React, { useState, useEffect } from 'react';
import { History, Filter, Search, Calendar, User } from 'lucide-react';
import { ECGReading, Patient } from '../types';

interface ECGHistoryProps {
  patients: Patient[];
}

export const ECGHistory: React.FC<ECGHistoryProps> = ({ patients }) => {
  const [readings, setReadings] = useState<ECGReading[]>([]);
  const [filteredReadings, setFilteredReadings] = useState<ECGReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchECGHistory();
  }, []);

  useEffect(() => {
    // Filter readings based on search term and selected patient
    let filtered = readings;
    
    if (selectedPatient) {
      filtered = readings.filter(reading => reading.patientCode === selectedPatient);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(reading => 
        reading.patientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reading.timestamp.includes(searchTerm)
      );
    }

    // Sort readings
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredReadings(filtered);
  }, [readings, searchTerm, selectedPatient, sortOrder]);

  const fetchECGHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://iot-584n.onrender.com/ecg/latest');
      
      if (!response.ok) {
        throw new Error('Failed to fetch ECG history');
      }
      
      const data: ECGReading[] = await response.json();
      setReadings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getHealthStatus = (reading: ECGReading) => {
    const alerts = [];
    
    if (reading.bpm > 100) alerts.push('Tachycardia');
    if (reading.bpm < 60) alerts.push('Bradycardia');
    if (reading.temperature > 37.5) alerts.push('Fever');
    
    return alerts.length > 0 ? alerts.join(', ') : 'Normal';
  };

  const getStatusColor = (reading: ECGReading) => {
    if (reading.bpm > 100 || reading.bpm < 60 || reading.temperature > 37.5) {
      return 'text-red-600 bg-red-50 dark:text-red-200 dark:bg-red-900';
    }
    return 'text-green-600 bg-green-50 dark:text-green-200 dark:bg-green-900';
  };

  const getPatientName = (patientCode: string) => {
    const patient = patients.find(p => p.patientCode === patientCode);
    return patient ? patient.name : 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 card-enter">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <History className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">ECG History</h2>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({filteredReadings.length} readings)</span>
          </div>
          <button
            onClick={fetchECGHistory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient code or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-center">
            <User className="h-4 w-4 text-gray-400 mr-2" />
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Patients</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.patientCode}>
                  {patient.name} ({patient.patientCode})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
            <p className="text-red-600 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-hover">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                BPM
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                RR (ms)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                HRV
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Temp (°C)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredReadings.length > 0 ? (
              filteredReadings.map((reading, index) => (
                <tr key={reading.id || index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {formatTimestamp(reading.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div>
                      <div className="font-medium">{getPatientName(reading.patientCode || '')}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{reading.patientCode || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {reading.bpm}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {reading.rr}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {reading.hrv}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {reading.temperature}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reading)}`}>
                      {getHealthStatus(reading)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm || selectedPatient ? 'No readings match your filters.' : 'No ECG history available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};