import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { Bar } from 'react-chartjs-2'; // Import Bar chart
import {
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Chart as ChartJS,
} from 'chart.js'; // Import necessary Chart.js components
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserFailure,
  deleteUserSuccess,
  signOut
} from '../redux/user/userSlice';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Profile() {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const pdfRef = useRef(null);
  const [image, setImage] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [imagePercent, setImagePercent] = useState(0);
  const [pdfPercent, setPdfPercent] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [pdfUrls, setPdfUrls] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chartData, setChartData] = useState(null); // State to store chart data

  const { currentUser, loading, error } = useSelector(state => state.user);

  // State to hold previous comparisons
  const [previousComparisons, setPreviousComparisons] = useState([]); // Initialize as an empty array

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
        } else {
          setPreviousComparisons([]);  // Handle non-array responses
        }
      } catch (error) {
        console.error('Error fetching comparisons:', error);
        setPreviousComparisons([]);  // Fallback to an empty array in case of error
      }
    };
    
  
    fetchComparisons();
  }, [currentUser]);


  useEffect(() => {
    if (image) {
      handleFileUpload(image, 'profilePicture');
    }
  }, [image]);

  useEffect(() => {
    if (pdf) {
      handleFileUpload(pdf, 'pdfFile');
    }
  }, [pdf]);

  useEffect(() => {
    // console.log(currentUser);
    if (currentUser?.pdfUrls) {
      setPdfUrls(currentUser.pdfUrls);
    }
  }, [currentUser]);

  const handleFileUpload = async (file, type) => {
    const storage = getStorage(app);
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (type === 'profilePicture') {
          setImagePercent(progress);
        } else if (type === 'pdfFile') {
          setPdfPercent(progress);
        }
      },
      (error) => {
        if (type === 'profilePicture') {
          setImageError(true);
        } else if (type === 'pdfFile') {
          setPdfError(true);
        }
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          if (type === 'pdfFile') {
            try {
              const res = await fetch(`/backend/user/upload/pdf/${currentUser._id}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify({ downloadURL }),
              });
              const data = await res.json();
              if (data.pdfUrls) {
                setPdfUrls(data.pdfUrls);
              }
            } catch (error) {
              console.error('Error updating PDF URLs:', error);
            }
          } else {
            setFormData(prev => ({
              ...prev,
              [type]: downloadURL,
            }));
          }
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleAskQuestion = async () => {
    try {
      const response = await fetch('https://major-extraction-and-comparison.onrender.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          term: question,
          pdfUrls,
        }),
      });
  
      const data = await response.json();
      if (data.error) {
        setAnswer(data.error);
        setChartData(null);
      } else {
        setAnswer(data);
  
        const labels = Object.keys(data);
        const values = Object.values(data).map(value => parseFloat(value));
  
        const newChartData = {
          labels,
          datasets: [
            {
              label: `${question} Levels`,
              data: values,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        };
  
        setChartData(newChartData);
  
        // Save comparison to backend
        await fetch(`/backend/user/save-comparison/${currentUser._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({
            term: question,
            data: newChartData,
          }),
        });
      }
    } catch (error) {
      console.error('Error asking question:', error);
      setAnswer('An error occurred while processing your request.');
      setChartData(null);
    }
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/backend/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          ...formData,
          profilePicture: formData.profilePicture,
          pdfFile: formData.pdfFile,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        dispatch(updateUserFailure(data));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/backend/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) {
        dispatch(deleteUserFailure(data));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error));
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/backend/auth/signout');
      dispatch(signOut());
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div 
    className="bg-cover bg-center min-h-screen flex items-center justify-center" 
    style={{ backgroundImage: `url('https://images.pexels.com/photos/48604/pexels-photo-48604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')` }}>
    <div className="bg-white bg-opacity-90 shadow-lg rounded-lg max-w-lg w-full p-8">
      <h1 className="text-3xl text-center font-semibold mb-6">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <img
          src={formData.profilePicture || currentUser.profilePicture}
          alt="profile"
          className="h-24 w-24 self-center cursor-pointer rounded-full object-cover mt-2"
          onClick={() => fileRef.current.click()}
        />
        <p className="text-sm self-center">
          {imageError ? (
            <span className="text-red-700">Error uploading image</span>
          ) : imagePercent > 0 && imagePercent < 100 ? (
            <span className="text-slate-700">{`Uploading image: ${imagePercent}%`}</span>
          ) : imagePercent === 100 ? (
            <span className="text-green-700">Image Uploaded Successfully</span>
          ) : (
            ''
          )}
        </p>

        <input
          defaultValue={currentUser.username}
          type="text"
          id="username"
          placeholder="Username"
          className="bg-slate-100 rounded-lg p-3"
          onChange={handleChange}
        />
        <input
          defaultValue={currentUser.email}
          type="email"
          id="email"
          placeholder="Email"
          className="bg-slate-100 rounded-lg p-3"
          onChange={handleChange}
        />
        <input
          type="password"
          id="password"
          placeholder="Password"
          className="bg-slate-100 rounded-lg p-3"
          onChange={handleChange}
        />

        <div className="mt-5">
          <label className="block mb-2 font-semibold">Upload PDF</label>
          <input
            type="file"
            ref={pdfRef}
            accept="application/pdf"
            onChange={(e) => setPdf(e.target.files[0])}
          />
        </div>
        <p className="text-sm self-center mt-2">
          {pdfError ? (
            <span className="text-red-700">Error uploading PDF</span>
          ) : pdfPercent > 0 && pdfPercent < 100 ? (
            <span className="text-slate-700">{`Uploading PDF: ${pdfPercent}%`}</span>
          ) : pdfPercent === 100 ? (
            <span className="text-green-700">PDF Uploaded Successfully</span>
          ) : (
            null
          )}
        </p>

        <button
          type="submit"
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Update'}
        </button>
      </form>

      <h2 className="text-xl mt-10 mb-5 font-semibold">Ask a Question</h2>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full bg-slate-100 rounded-lg p-3 mb-4"
        placeholder="Type your question here..."
      />
      <button
        onClick={handleAskQuestion}
        className="bg-blue-500 text-white p-3 rounded-lg uppercase hover:opacity-95 w-full"
      >
        Ask
      </button>

      {/* Conditional rendering for the answer */}
      {answer && (
        <div className="mt-5 p-4 bg-green-100 rounded-lg">
          <h3 className="font-semibold">Answer:</h3>
          {typeof answer === 'string' ? (
            <p>{answer}</p>
          ) : (
            <div>
              <pre>{JSON.stringify(answer, null, 2)}</pre>
            </div>
          )}

          {/* Render the chart if chartData is available */}
          {chartData && (
            <div className="mt-5">
              <Bar 
                data={chartData} 
                options={{
                  scales: {
                    y: { beginAtZero: true }
                  },
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: `${question} Levels Comparison` }
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Uploaded PDFs:</h2>
        <ul className="list-decimal ml-5">
          {pdfUrls.map((url, index) => (
            <li key={index} className="mb-2">
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                {`PDF ${index + 1}`}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleDeleteAccount}
        className="mt-10 bg-red-600 text-white p-3 rounded-lg uppercase hover:opacity-95 w-full"
      >
        Delete Account
      </button>

      <button
        onClick={handleSignOut}
        className="mt-3 bg-slate-600 text-white p-3 rounded-lg uppercase hover:opacity-95 w-full"
      >
        Sign Out
      </button>
    </div>
    <h2 className="text-xl mt-10 mb-5 font-semibold">Previous Comparisons</h2>
    <div>
      {previousComparisons.map((comparison, index) => (
        <div key={index}>
          <h3>{comparison.term}</h3>
          <Bar data={comparison.data} options={{ responsive: true }} />
        </div>
      ))}
    </div>
    </div>
  );
}
