import React, { useState } from 'react';
import { User, UserPlus, CheckCircle } from 'lucide-react';
import { Patient } from '../types';

interface PatientRegistrationProps {
  onPatientRegistered: (patient: Patient) => void;
}

export const PatientRegistration: React.FC<PatientRegistrationProps> = ({
  onPatientRegistered
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://iot-584n.onrender.com/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to register patient');
      }

      const patient: Patient = await response.json();
      setRegisteredPatient(patient);
      onPatientRegistered(patient);
      
      // Reset form
      setFormData({ name: '', age: '', gender: 'male' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (registeredPatient) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 card-enter">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Patient Registered Successfully!</h2>
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
            <p className="text-lg font-semibold text-green-800 dark:text-green-200">
              Patient Code: <span className="font-mono text-2xl">{registeredPatient.patientCode}</span>
            </p>
            <p className="text-green-700 dark:text-green-300 mt-2">
              {registeredPatient.name} ({registeredPatient.age} years, {registeredPatient.gender})
            </p>
          </div>
          <button
            onClick={() => setRegisteredPatient(null)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register Another Patient
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 card-enter">
      <div className="flex items-center mb-6">
        <User className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Patient Registration</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter patient's full name"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Age
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            required
            min="1"
            max="120"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter age"
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
            <p className="text-red-600 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !formData.name || !formData.age}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <UserPlus className="h-5 w-5 mr-2" />
              Register Patient
            </>
          )}
        </button>
      </form>
    </div>
  );
};