import React from 'react';

export default function About() {
  return (
    <div className="bg-cover bg-center min-h-screen flex items-center justify-center py-12" 
         style={{ backgroundImage: `url('https://images.pexels.com/photos/1028599/pexels-photo-1028599.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')` }}>
      <div className="bg-white shadow-lg rounded-lg max-w-4xl mx-auto p-8 bg-opacity-80">
        <h1 className="text-4xl font-bold text-center text-slate-800 mb-6">About Us</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-700 mb-4">Introduction</h2>
          <p className="mb-4 text-slate-600">
            In today’s fast-paced world, managing your health can feel overwhelming. That's where Health Matrix comes in. Our innovative web application allows you to easily upload and compare your medical reports, helping you track your health journey over time. With clear insights into your health trends, you can make informed decisions for a better, healthier life.
          </p>
          <p className="mb-4 text-slate-600">
            Built on a reliable technology foundation, Health Matrix provides a user-friendly experience that makes understanding your medical data simple and accessible. We’re committed to supporting you in taking control of your health and well-being.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-700 mb-4">Empowering Your Health Journey</h2>
          <p className="text-slate-600">
            Our mission is to empower you with the tools and insights you need to navigate your health confidently. By transforming complex medical information into straightforward insights, we help you take charge of your health and make proactive choices for your well-being.
          </p>
        </section>
      </div>
    </div>
  );
}
