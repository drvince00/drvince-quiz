'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Home() {
  const inputRef = useRef();
  const [quiz, setQuiz] = useState(null);
  const [cat, setCat] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('cat 1:', cat);
        const res = await axios.get(`/api/quiz`, { params: { cat } });
        setQuiz(res.data);
        console.log('quiz:', res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [cat]);

  const handleClick = async () => {
    const name = inputRef.current.value;
    if (name) {
      const response = await fetch(`/api/quiz?cat=${cat}`);
      const { sessionId } = await response.json();
      router.push(`/quiz/${sessionId}?userName=${encodeURIComponent(name)}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-64 space-y-4">
        <div className="flex justify-around items-center">
          {['all', '1', '2', '3'].map((value) => (
            <label key={value} className="flex items-center space-x-2">
              <input
                type="radio"
                checked={cat === value}
                name="cat"
                value={value}
                id={value}
                onChange={(e) => setCat(e.target.value)}
                className="form-radio"
              />
              <span>{value === 'all' ? 'All' : `Lv ${value}`}</span>
            </label>
          ))}
        </div>
        <input
          placeholder="enter your name"
          className="w-full h-8 px-2 border border-gray-300 rounded text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ref={inputRef}
        />
        <button
          className="w-full h-8 bg-blue-500 text-white rounded text-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          onClick={handleClick}
        >
          Start
        </button>
      </div>
    </div>
  );
}
