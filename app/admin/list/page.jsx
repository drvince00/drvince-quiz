'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export default function List() {
  const [quizzes, setQuizzes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchQuizzes(currentPage);
  }, [currentPage]);

  const fetchQuizzes = async (page) => {
    try {
      const response = await fetch(`/api/quiz?page=${page}&limit=10&order=id`);
      const data = await response.json();
      setQuizzes(data.quiz);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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

  return (
    <div className="container mx-auto p-4 w-4/5">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">퀴즈 목록</h1>
        <div className="flex space-x-4">
          <Link
            href="/admin/addQuiz"
            className="p-1 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
          >
            <Image src="/plus_icon.png" alt="Add Quiz" width={32} height={32} />
          </Link>
          <Link
            href="/"
            className="p-1 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
          >
            <Image src="/list-icon.png" alt="Go to Quiz" width={32} height={32} />
          </Link>
        </div>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-center w-1/12">ID</th>
            <th className="border border-gray-300 p-2 text-center w-2/12">이미지</th>
            <th className="border border-gray-300 p-2 text-center w-5/12">문제</th>
            <th className="border border-gray-300 p-2 text-center w-1/12">종류</th>
            <th className="border border-gray-300 p-2 text-center w-1/12">유형</th>
            <th className="border border-gray-300 p-2 text-center w-2/12">액션</th>
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
              <td className="border border-gray-300 p-2 truncate">{quiz.question}</td>
              <td className="border border-gray-300 p-2 text-center">{quiz.quest_type}</td>
              <td className="border border-gray-300 p-2 text-center">{quiz.type}</td>
              <td className="border border-gray-300 p-2">
                <div className="flex justify-center items-center space-x-2">
                  <Link
                    href={`/admin/addQuiz?id=${quiz.id}`}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-center items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="mx-1 px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          이전
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="mx-1 px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          다음
        </button>
      </div>
      <div className="mt-2 text-center text-sm text-gray-600">
        총 {totalItems}개의 퀴즈, {totalPages} 페이지
      </div>
    </div>
  );
}
