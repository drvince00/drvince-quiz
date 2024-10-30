'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Home() {
  const inputRef = useRef();
  const [quiz, setQuiz] = useState(null);
  const [questType, setQuestType] = useState('All');
  const [questionCount, setQuestionCount] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/quiz`, { params: { questType, limit: questionCount } });
        setQuiz(res.data);
        console.log('quiz:', res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [questType, questionCount]);

  const handleClick = async () => {
    const name = inputRef.current.value;
    if (name) {
      const response = await fetch(`/api/quiz?questType=${questType}&limit=${questionCount}`);
      const { sessionId } = await response.json();
      router.push(`/quiz/${sessionId}?userName=${encodeURIComponent(name)}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-64 space-y-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="questType" className="text-lg font-medium">
            Choose Type
          </label>
          <select
            id="questType"
            name="questType"
            className="flex-1 px-3 py-2 border rounded-md"
            value={questType}
            onChange={(e) => setQuestType(e.target.value)}
          >
            {['All', 'Topik', 'Food', 'Culture'].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-around items-center">
          {[5, 10, 20, 30].map((count) => (
            <label key={count} className="flex items-center space-x-2">
              <input
                type="radio"
                checked={questionCount === count}
                name="questionCount"
                value={count}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="form-radio"
              />
              <span>{count}</span>
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
