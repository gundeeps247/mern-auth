import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';

export default function Comparisons() {
  const { currentUser } = useSelector((state) => state.user);
  const [previousComparisons, setPreviousComparisons] = useState([]);
  const [filteredComparisons, setFilteredComparisons] = useState([]);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const fetchComparisons = async () => {
      try {
        const response = await fetch(`/backend/user/comparisons/${currentUser._id}`, {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`,
          },
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          setPreviousComparisons(data);
          setFilteredComparisons(data);
        }
      } catch (error) {
        console.error('Error fetching comparisons:', error);
      }
    };

    if (currentUser) {
      fetchComparisons();
    }
  }, [currentUser]);

  const handleDateFilter = (e) => {
    const selectedDate = e.target.value;
    setFilterDate(selectedDate);
    if (selectedDate) {
      const filtered = previousComparisons.filter(comparison => {
        const comparisonDate = new Date(comparison.date).toISOString().split('T')[0]; 
        return comparisonDate === selectedDate;
      });
      setFilteredComparisons(filtered);
    } else {
      setFilteredComparisons(previousComparisons); 
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-gray-800">Previous Comparisons</h1>
    
      
      <div className="mb-4">
        <label htmlFor="filter-date" className="block text-sm font-medium text-gray-700">Filter by Date:</label>
        <input 
          type="date" 
          id="filter-date" 
          value={filterDate}
          onChange={handleDateFilter}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="space-y-8">
        {filteredComparisons.length > 0 ? (
          filteredComparisons.map((comparison, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
              <h2 className="text-xl font-semibold text-gray-700">{comparison.term}</h2>
              <p className="text-sm text-gray-500">
                Date: {new Date(comparison.date).toLocaleDateString()}
              </p>
              <div className="mt-4">
                <Bar data={comparison.data} options={{ responsive: true }} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No comparisons found for the selected date.</p>
        )}
      </div>
    </div>
  );
}
