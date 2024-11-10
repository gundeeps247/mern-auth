import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { medicalQuerySuggestions } from './ medicaldataset'; // Import the suggestions
import './MedicalQueryProcessor.css';

export default function MedicalQueryProcessor() {
  const { currentUser } = useSelector(state => state.user);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]); // State to store filtered suggestions

  // Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech Recognition Error:', event.error);
      setIsListening(false);
    };
  }

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  const processQuery = async () => {
    if (input.trim().length < 5) {
      setOutput("Please enter a valid query (at least 5 characters).");
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      const prompt = `Please provide a comprehensive guide on ${input}. Include symptoms, treatments, and self-care tips.`;

      const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-large", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 300,
            do_sample: true
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const answer = data[0]?.generated_text || "No detailed answer received.";
        setOutput(answer);
      } else {
        const errorData = await response.json();
        setOutput(`Error: ${errorData.error || "Unable to process your query."}`);
      }
    } catch (error) {
      setOutput("An error occurred. Please check your connection or try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter suggestions based on user input
  const handleInputChange = (e) => {
    const query = e.target.value;
    setInput(query);
    
    // Filter suggestions
    if (query.length > 0) {
      const filtered = medicalQuerySuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  };

  // Select a suggestion and populate input
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setFilteredSuggestions([]); // Hide suggestions after selection
  };

  return (
    <div className="medical-query-bg">
      <div className="container">
        <h2>Medical Query Processor</h2>
        <div className="input-group">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter your medical query"
          />
          <i
            className={`fas fa-microphone mic-icon ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
          ></i>
          <div className="example-text">e.g., 'What are common cold flu medicines?'</div>

          {/* Display filtered suggestions */}
          {filteredSuggestions.length > 0 && (
            <div className="suggestions">
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={processQuery}>Submit</button>
        {loading && <div className="loading"><div className="spinner"></div> Processing...</div>}
        <div className="output">{typeof output === 'string' ? output : "Solution to your queries."}</div>
        <div className="advisory-note">
          <p>Please note: These results are AI-generated. For professional medical advice, consult a healthcare provider.</p>
        </div>
      </div>
    </div>
  );
}
