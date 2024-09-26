import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';

export default function Comparisons() {
  const { currentUser } = useSelector((state) => state.user);
  const [previousComparisons, setPreviousComparisons] = useState([]);

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
        }
      } catch (error) {
        console.error('Error fetching comparisons:', error);
      }
    };

    if (currentUser) {
      fetchComparisons();
    }
  }, [currentUser]);

  return (
    <div className="p-4 sm:p-8 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-gray-800">Previous Comparisons</h1>
      <div className="space-y-8">
        {previousComparisons.map((comparison, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
            <h2 className="text-xl font-semibold text-gray-700">{comparison.term}</h2>
            <div className="mt-4">
              <Bar data={comparison.data} options={{ responsive: true }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
