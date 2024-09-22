import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent refreshing the page when we submit the form
    try {
      setLoading(true);
      setError(false);
      const res = await fetch('/backend/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(true);
        return;
      }
      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      setError(true);
    }
  };

  return (
    <div 
      className="bg-cover bg-center min-h-screen flex items-center justify-center" 
      style={{ backgroundImage: `url('https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')` }}>
      <div className="bg-white shadow-lg rounded-lg max-w-md w-full p-8 bg-opacity-90">
        <h1 className="text-3xl text-center font-semibold mb-6">Sign Up</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Username" 
            id="username" 
            className="bg-slate-100 p-3 rounded-lg" 
            onChange={handleChange} 
            required 
          />
          <input 
            type="email" 
            placeholder="Email" 
            id="email" 
            className="bg-slate-100 p-3 rounded-lg" 
            onChange={handleChange} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            id="password" 
            className="bg-slate-100 p-3 rounded-lg" 
            onChange={handleChange} 
            required 
          />
          <button 
            disabled={loading} 
            className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
          <OAuth />
        </form>
        <div className="flex gap-2 mt-5">
          <p>Already have an account?</p>
          <Link to="/sign-in">
            <span className="text-blue-500">Sign In</span>
          </Link>
        </div>
        <p className="text-red-700 mt-5">{error && 'Something went wrong!'}</p>
      </div>
    </div>
  );
}
