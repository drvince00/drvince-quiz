'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';

import volumeon from '../../../public/volumeon.png';
import volumeoff from '../../../public/volumeoff.png';
import stopBtn from '../../../public/stop.png';

export default function Quiz() {
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState({});
  const [lock, setLock] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [imageSrc, setImageSrc] = useState(null);
  const [userName, setUserName] = useState('User');

  const option_array = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const router = useRouter();
  const { sessionId } = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchQuizData() {
      try {
        const response = await fetch(`/api/quiz?sessionId=${sessionId}`);
        const data = await response.json();
        setQuiz(data.quiz);
        setQuestion(data.quiz[0]);
        setLoading(false);
      } catch (error) {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다:', error);
        setLoading(false);
      }
    }
    fetchQuizData();
    setUserName(searchParams.get('userName') || 'User');
  }, [sessionId, searchParams]);

  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      correctAudioRef.current = new Audio('/correct.mp3');
      wrongAudioRef.current = new Audio('/wrong.mp3');
    }
  }, []);

  useEffect(() => {
    if (question && question.type === 'PIC') {
      // pic_path가 이미 전체 경로를 포함하고 있으므로, 추가적인 '/quiz/' 경로를 붙이지 않습니다.
      setImageSrc(question.pic_path);
    }
  }, [question]);

  const playSound = (isCorrect) => {
    if (isSoundOn && typeof window !== 'undefined') {
      if (isCorrect && correctAudioRef.current) {
        correctAudioRef.current.play().catch((e) => console.error('오디오 재생 실패:', e));
      } else if (!isCorrect && wrongAudioRef.current) {
        wrongAudioRef.current.play().catch((e) => console.error('오디오 재생 실패:', e));
      }
    }
  };

  const checkAns = (e, ans) => {
    if (!lock) {
      if (question.ans === ans) {
        e.target.classList.add('bg-[#dffff2]', 'border-[#00d397]');
        setScore((prev) => prev + 1);
        playSound(true);
      } else {
        e.target.classList.add('bg-[#FFEBEB]', 'border-[#ff4a4a]');
        option_array[question.ans - 1].current.classList.add('bg-[#dffff2]', 'border-[#00d397]');
        playSound(false);
      }
      setLock(true);
    }
  };

  const next = () => {
    if (lock) {
      if (index === quiz.length - 1) {
        setResult(true);
        return;
      }
      setIndex((prev) => prev + 1);
      setQuestion(quiz[index + 1]);
      setLock(false);
      option_array.forEach((option) => {
        option.current.classList.remove(
          'bg-[#FFEBEB]',
          'border-[#ff4a4a]',
          'bg-[#dffff2]',
          'border-[#00d397]'
        );
      });
    }
  };

  const reset = () => {
    router.push('/');
  };

  const volumeToggleClick = () => {
    setIsSoundOn(!isSoundOn);
  };

  const stopClick = () => {
    Swal.fire({
      title: '퀴즈를 중단하시겠습니까?',
      text: '진행 상황이 저장되지 않습니다.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '네, 중단합니다',
      cancelButtonText: '아니오, 계속합니다',
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/');
      }
    });
  };

  if (loading) {
    return <p className="text-center text-xl">Loading...</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-[#262626] flex flex-col gap-5 rounded-lg p-5 md:p-10">
      <div className={`${question.type === 'TXT' ? 'w-4/5 mx-auto' : 'w-full'}`}>
        <div className="flex justify-end items-center mb-5">
          <button onClick={volumeToggleClick} className="w-8 h-8 ml-2">
            <Image src={isSoundOn ? volumeon : volumeoff} alt="volume" width={20} height={20} />
          </button>
          <button onClick={stopClick} className="w-8 h-8 ml-2">
            <Image src={stopBtn} alt="stopBtn" width={20} height={20} />
          </button>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-5">Quiz App</h1>
        <hr className="h-0.5 bg-[#707070] border-0 mb-5" />
      </div>
      {result ? (
        <div className="flex flex-col items-center">
          <h2 className="text-xl md:text-2xl font-medium mb-5">
            {userName} scored {score} out of {quiz.length}.
          </h2>
          <button
            className="w-48 md:w-64 h-12 md:h-16 bg-[#553f9a] text-white text-lg md:text-2xl font-medium rounded-lg"
            onClick={reset}
          >
            Reset
          </button>
        </div>
      ) : (
        <>
          <div
            className={`flex flex-col md:flex-row gap-5 ${
              question.type === 'TXT' ? 'justify-center' : ''
            }`}
          >
            {question.type === 'PIC' && imageSrc && (
              <div className="md:w-1/2">
                <Image
                  src={imageSrc}
                  alt="Quiz Image"
                  width={400}
                  height={400}
                  layout="responsive"
                  objectFit="contain"
                />
              </div>
            )}
            <div className={question.type === 'PIC' ? 'md:w-1/2' : 'w-4/5 mx-auto'}>
              <h2 className="text-xl md:text-2xl font-medium mb-4">
                {index + 1}. {question.question}
              </h2>
              <ul>
                {['option1', 'option2', 'option3', 'option4'].map((optionKey, i) => (
                  <li
                    key={i}
                    ref={option_array[i]}
                    onClick={(e) => checkAns(e, i + 1)}
                    className="flex items-center h-[60px] md:h-[70px] pl-4 border border-[#686868] rounded-lg mb-3 text-lg md:text-xl cursor-pointer"
                  >
                    {question[optionKey]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center mt-5">
            <button
              className="w-48 md:w-64 h-12 md:h-16 bg-[#553f9a] text-white text-lg md:text-2xl font-medium rounded-lg mb-3"
              onClick={next}
            >
              Next
            </button>
            <div className="text-center text-lg md:text-xl">
              {index + 1} of {quiz.length} questions
            </div>
          </div>
        </>
      )}
    </div>
  );
}
