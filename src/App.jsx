import React, { useState, useEffect } from 'react';

// A simple loading spinner component
const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-violet-400"></div>
  </div>
);

// A component to render each search result card
const ResultCard = ({ result, index }) => (
    <div 
      className="bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-xl p-6 border border-gray-700 hover:border-violet-500 transition-all duration-300 transform hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-baseline gap-4">
        <span className="text-xl font-bold text-violet-400">#{index + 1}</span>
        <h3 className="text-lg font-semibold text-gray-100 truncate">
          <a 
            href={result.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-violet-300 hover:underline transition-colors"
          >
            {result.title || result.link}
          </a>
        </h3>
      </div>
      <p className="mt-3 text-gray-300 text-sm leading-relaxed">
        {result.summary}
      </p>
    </div>
);


function App() {
  // State management for all dynamic parts of our app
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bgImage, setBgImage] = useState('');

  // Unsplash API Access Key from your original script
  const UNSPLASH_ACCESS_KEY = "f_ih_GrP0MZ4oXPNDkvuJiWwE3l1-eC_kKSEL0wsKqE";

  // useEffect hook to fetch a background image when the component loads and set an interval to change it
  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const response = await fetch(
          `https://api.unsplash.com/photos/random?query=technology,galaxy,programming,circuits&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
        );
        if (!response.ok) throw new Error('Unsplash API limit reached or invalid key.');
        const data = await response.json();
        setBgImage(data.urls.full);
      } catch (err) {
        console.error("Failed to load background image:", err);
        // Set a fallback background in case the API fails
        setBgImage('https://images.unsplash.com/photo-1518770660439-4636190af475'); 
      }
    };

    fetchBackgroundImage(); // Fetch on initial load
    const intervalId = setInterval(fetchBackgroundImage, 15000); // Change every 15 seconds

    // Cleanup function: this runs when the component is unmounted to prevent memory leaks
    return () => clearInterval(intervalId);
  }, []); // The empty dependency array [] means this effect runs only once on mount

  // Function to handle the search logic
  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page
    if (!query.trim()) {
      setError("Please enter a search query.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("http://127.0.0.1:5000/rankDocuments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Something went wrong with the server response.");
      }

      const data = await response.json();
      setResults(data.results || []);

    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching results. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-gray-900 bg-cover bg-center bg-fixed text-white p-4 sm:p-8 transition-all duration-1000" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <main className="relative z-10 container mx-auto flex flex-col items-center">
        
        {/* Header */}
        <header className="text-center my-8 sm:my-12">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Sci-Tech Crawl</span>
          </h1>
          <p className="text-gray-300 mt-4 text-lg">Your portal to the world of science and technology.</p>
        </header>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl mb-12">
          <div className="relative flex items-center bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-full shadow-2xl border border-gray-700">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for AI, quantum computing, biotech..."
              className="w-full bg-transparent text-lg text-white placeholder-gray-400 py-4 pl-6 pr-24 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-12 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-white font-semibold flex items-center justify-center transition-all duration-300 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isLoading ? '...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Results Section */}
        <div className="w-full max-w-4xl">
          {isLoading && <Spinner />}
          {error && <p className="text-center text-red-400 bg-red-900 bg-opacity-50 p-4 rounded-lg">{error}</p>}
          
          {!isLoading && !error && results.length === 0 && query && (
            <p className="text-center text-gray-400">No results found for your query.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((result, index) => (
              <ResultCard key={result.link || index} result={result} index={index} />
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
