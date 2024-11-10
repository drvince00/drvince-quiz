'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import qs from 'qs';

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function Home() {
  const inputRef = useRef();
  const [quiz, setQuiz] = useState(null);
  const [questType, setQuestType] = useState('All');
  const [questionCount, setQuestionCount] = useState(10);
  const router = useRouter();

  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);

  const [audioLoaded, setAudioLoaded] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState(['Topik', 'Food', 'Culture']);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((c) => c !== category)
        : [...prevCategories, category]
    );
  };

  useEffect(() => {
    console.log('오디오 프리로드 시작');
    correctAudioRef.current = new Audio('/sounds/correct.mp3');
    wrongAudioRef.current = new Audio('/sounds/wrong.mp3');

    sessionStorage.setItem('audioPreloaded', 'true');
    console.log('오디오 프리로드 완료');
    setAudioLoaded(true);
  }, []);

  useEffect(() => {
    if (selectedCategories.length > 0) {
      const fetchQuiz = async () => {
        setIsLoading(true);
        try {
          const res = await axios.get(`/api/quiz`, {
            params: {
              questType: selectedCategories,
              limit: questionCount,
              random: true,
            },
            paramsSerializer: (params) => {
              return qs.stringify(params, { arrayFormat: 'repeat' });
            },
          });
          setQuiz(res.data);
          console.log('퀴즈 데이터 로드됨:', res.data);
        } catch (err) {
          console.error('퀴즈 데이터 로드 실패:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchQuiz();
    } else {
      setQuiz(null);
    }
  }, [selectedCategories, questionCount]);

  const handleClick = async () => {
    const name = inputRef.current.value;

    if (name && audioLoaded && quiz) {
      try {
        sessionStorage.setItem('quizData', JSON.stringify(quiz.quiz));
        await router.push(`/quiz/play?userName=${encodeURIComponent(name)}`);
      } catch (error) {
        console.error('라우팅 에러:', error);
      }
    } else {
      console.log('버튼 비활성화 이유:', {
        noName: !name,
        noAudio: !audioLoaded,
        noQuiz: !quiz,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <img
        src="/k-quiz-cat.png"
        alt="Quiztokr Logo"
        className="mb-4"
        style={{ width: '380px', height: 'auto' }}
      />

      <div className="w-64 space-y-4">
        <div className="flex justify-center items-center gap-2">
          <label className="text-lg font-medium" style={{ marginRight: '16px' }}>
            Category
          </label>
          {['Topik', 'Food', 'Culture'].map((type) => (
            <label key={type} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedCategories.includes(type)}
                onChange={() => handleCategoryChange(type)}
                className="form-checkbox"
              />
              <span>{type}</span>
            </label>
          ))}
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
          className={`w-full h-8 ${
            audioLoaded && quiz && !isLoading ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'
          } text-white rounded text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          onClick={handleClick}
          disabled={!audioLoaded || !quiz || selectedCategories.length === 0 || isLoading}
        >
          {isLoading ? 'Loading...' : !audioLoaded ? 'Loading Audio...' : 'Start'}
        </button>
      </div>
    </div>
  );
}
