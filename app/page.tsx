'use client'
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [query, setQuery] = useState('');
  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [taskResult, setTaskResult] = useState(null);

  // Example JSON image data with 100 images
  const [imageData, setImageData] = useState(
    Array.from({ length: 100 }, (_, index) => ({
      url: `https://via.placeholder.com/250x180?text=Image+${index + 1}`,
      title: `Image ${index + 1}`,
    }))
  );

  useEffect(() => {
    if (taskId && !isTaskComplete) {
      const intervalId = setInterval(async () => {
        const response = await fetch(`http://localhost:3000/api/task-status/${taskId}`);
        const result = await response.json();
        if (result.state === 'SUCCESS') {
          setIsLoading(false);
          setIsTaskComplete(true);
          setTaskResult(result.status);
          clearInterval(intervalId);
          setImageData(result.result);
        }
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [taskId, isTaskComplete]);

  const onClick = async () => {
    setIsLoading(true);
    setIsTaskComplete(false);

    // Start the task by calling the API
    const response = await fetch('http://localhost:3000/api/python', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query }),
    });
    const data = await response.json();
    setTaskId(data.task_id); // Save the task id to poll the status
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <h1 className="text-4xl font-bold my-8">Frame Extract Tool</h1>
      
      {/* Input and button section */}
      <div className="mb-8 w-full max-w-md">
        <label className="block text-gray-700 text-sm font-bold mb-2">Query</label>
        <input
          type="text"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Insert query here"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4 rounded focus:outline-none focus:shadow-outline"
          onClick={onClick}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Submit'}
        </button>
      </div>

      {isLoading && !isTaskComplete && (
        <div className="flex justify-center items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
          <span>Waiting for extracting....</span>
        </div>
      )}

      {isTaskComplete && (
        <div className="mt-4 text-green-600">
          <p>{taskResult ? `Task Complete: ${taskResult}` : 'Task Completed Successfully!'}</p>
        </div>
      )}

      {/* Scrollable images container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 max-w-7xl">
        {imageData.map((image, index) => (
          <div key={index} className="relative w-full h-64 overflow-hidden bg-gray-200 rounded-lg shadow-lg">
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-xs text-white px-4 py-2">
              {image.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
