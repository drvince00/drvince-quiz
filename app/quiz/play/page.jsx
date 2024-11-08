'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';

import volumeon from '../../../public/volumeon.png';
import volumeoff from '../../../public/volumeoff.png';
import stopBtn from '../../../public/stop.png';

export default function QuizPlay() {
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
  const [categoryStats, setCategoryStats] = useState({});

  const option_array = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const router = useRouter();
  const searchParams = useSearchParams();

  const correctAudioRef = useRef(new Audio('/sounds/correct.mp3'));
  const wrongAudioRef = useRef(new Audio('/sounds/wrong.mp3'));

  useEffect(() => {
    // console.log('퀴즈 페이지 마운트');
    // sessionStorage에서 퀴즈 데이터 가져오기
    const quizData = sessionStorage.getItem('quizData');
    // console.log('sessionStorage 데이터:', quizData);

    if (quizData) {
      const parsedData = JSON.parse(quizData);
      // console.log('파싱된 퀴즈 데이터:', parsedData);
      setQuiz(parsedData);
      setQuestion(parsedData[0]);
      setLoading(false);
    } else {
      console.log('퀴즈 데이터 없음');
    }

    setUserName(searchParams.get('userName') || 'User');
  }, [searchParams]);

  useEffect(() => {
    if (question && question.type === 'PIC') {
      // console.log('Question 데이터:', question);
      // console.log('원본 이미지 경로:', question.pic_path);

      // GitHub raw 콘텐츠 URL 생성
      const githubUrl = `https://raw.githubusercontent.com/drvince00/drvince-quiz/main/public${question.pic_path}`;

      console.log('GitHub 이미지 URL:', githubUrl);
      setImageSrc(githubUrl);
    }
  }, [question]);

  useEffect(() => {
    if (quiz.length > 0) {
      const stats = quiz.reduce((acc, q) => {
        if (!acc[q.quest_type]) {
          acc[q.quest_type] = { total: 0, correct: 0 };
        }
        acc[q.quest_type].total += 1;
        return acc;
      }, {});
      setCategoryStats(stats);
    }
  }, [quiz]);

  const playSound = async (isCorrect) => {
    if (!isSoundOn) return;
    try {
      const audioRef = isCorrect ? correctAudioRef.current : wrongAudioRef.current;
      if (audioRef) {
        audioRef.currentTime = 0;
        await audioRef.play();
      }
    } catch (error) {
      console.error('오디오 재생 오류:', error);
    }
  };

  const checkAns = (e, ans) => {
    if (!lock) {
      if (question.ans === ans) {
        e.target.classList.add('bg-[#dffff2]', 'border-[#00d397]');
        setScore((prev) => prev + 1);
        setCategoryStats((prev) => ({
          ...prev,
          [question.quest_type]: {
            ...prev[question.quest_type],
            correct: prev[question.quest_type].correct + 1,
          },
        }));
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
      title: 'Are you sure you want to quit the quiz?',
      text: 'Your progress will not be saved.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, quit',
      cancelButtonText: 'No, continue',
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/');
      }
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">퀴즈를 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-[#262626] flex flex-col gap-5 rounded-lg p-5 md:p-10">
      {result ? (
        <div className="flex flex-col items-center">
          <h2 className="text-xl md:text-2xl font-medium mb-5">
            {userName} scored {score} out of {quiz.length}
          </h2>
          <div className="w-full max-w-md mb-8">
            <h3 className="text-lg md:text-xl font-medium mb-4">Category Statistics</h3>
            {Object.entries(categoryStats).map(([type, stats]) => (
              <div
                key={type}
                className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded"
              >
                <span className="text-lg">{type}</span>
                <div className="flex items-center gap-4">
                  <span>
                    {stats.correct} out of {stats.total}
                  </span>
                  <span className="text-blue-600">
                    ({Math.round((stats.correct / stats.total) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            className="w-48 md:w-64 h-12 md:h-16 bg-[#553f9a] text-white text-lg md:text-2xl font-medium rounded-lg"
            onClick={reset}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className={`${question.type === 'TXT' ? 'w-4/5 mx-auto' : 'w-full'}`}>
            <div className="flex justify-end items-center mb-5">
              <button onClick={volumeToggleClick} className="w-8 h-8 ml-2">
                <Image src={isSoundOn ? volumeon : volumeoff} alt="volume" width={20} height={20} />
              </button>
              <button onClick={stopClick} className="w-8 h-8 ml-2">
                <Image src={stopBtn} alt="stopBtn" width={20} height={20} />
              </button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-5">K-Quiz Cat</h1>
            <hr className="h-0.5 bg-[#707070] border-0 mb-5" />
          </div>
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
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    console.error('이미지 로딩 실패:', imageSrc);
                    // 대체 이미지 표시 또는 다른 처리
                  }}
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
