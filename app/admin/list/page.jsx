'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quiz?order=id');
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      const data = await response.json();
      // API 응답 구조에 따라 이 부분을 수정하세요
      setQuizzes(data.quiz || []); // data.quiz가 없으면 빈 배열을 사용
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('퀴즈 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: '정말로 삭제하시겠습니까?',
      text: '이 작업은 되돌릴 수 없습니다!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '네, 삭제합니다!',
      cancelButtonText: '취소',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/quiz/${id}`, {
            method: 'DELETE',
          });
          const data = await response.json();

          if (response.ok) {
            setQuizzes(quizzes.filter((quiz) => quiz.id !== id));
            Swal.fire('삭제되었습니다!', '퀴즈가 성공적으로 삭제되었습니다.', 'success');
          } else {
            Swal.fire(
              '삭제 실패',
              data.message || '퀴즈를 삭제하는 중 문제가 발생했습니다.',
              'error'
            );
          }
        } catch (error) {
          console.error('퀴즈 삭제 중 오류 발생:', error);
          Swal.fire('오류', '서버와의 통신 중 문제가 발생했습니다.', 'error');
        }
      }
    });
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex justify-center">
      <div className="container w-4/5 p-4">
        <h1 className="text-3xl font-bold mb-4 text-center">퀴즈 목록</h1>
        <div className="text-right mb-4">
          <Link href="/admin/addQuiz" className="inline-block">
            <Image src="/add_circle_icon.png" alt="퀴즈 추가" width={40} height={40} />
          </Link>
        </div>
        {quizzes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-center">ID</th>
                  <th className="border border-gray-300 p-2 text-center">이미지</th>
                  <th className="border border-gray-300 p-2 text-center">문제</th>
                  <th className="border border-gray-300 p-2 text-center">레벨</th>
                  <th className="border border-gray-300 p-2 text-center">유형</th>
                  <th className="border border-gray-300 p-2 text-center">액션</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td className="border border-gray-300 p-2 text-center">{quiz.id}</td>
                    <td className="border border-gray-300 p-2">
                      {quiz.pic_path ? (
                        <div className="flex justify-center items-center">
                          <Image src={quiz.pic_path} alt="Quiz Image" width={50} height={50} />
                        </div>
                      ) : (
                        <div className="flex justify-center items-center w-full h-full">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-300 p-2">{quiz.question}</td>
                    <td className="border border-gray-300 p-2 text-center">{quiz.level}</td>
                    <td className="border border-gray-300 p-2 text-center">{quiz.type}</td>
                    <td className="border border-gray-300 p-2 text-center">
                      <Link
                        href={`/admin/addQuiz?id=${quiz.id}`}
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center">퀴즈가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
