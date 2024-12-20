'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function AddQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [data, setData] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    ans: '1',
    quest_type: 'TOPIK',
    type: 'TXT',
    pic_path: '',
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value ?? '' }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      const newImagePreview = URL.createObjectURL(file);
      setImagePreview(newImagePreview);
      setData((prev) => ({
        ...prev,
        type: 'PIC',
        pic_path: file.name,
      }));
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview(null);
    setData((prev) => ({ ...prev, type: 'TXT', pic_path: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (id) {
      const fetchQuizData = async () => {
        try {
          const response = await axios.get(`/api/quiz`, {
            params: {
              id: id,
              t: new Date().getTime(),
            },
            headers: {
              'Cache-Control': 'no-cache',
            },
          });

          const quizData = response.data;
          setData({
            question: quizData.question || '',
            option1: quizData.option1 || '',
            option2: quizData.option2 || '',
            option3: quizData.option3 || '',
            option4: quizData.option4 || '',
            ans: quizData.ans || '1',
            quest_type: quizData.quest_type || 'TOPIK',
            type: quizData.type || 'TXT',
            pic_path: quizData.pic_path || '',
          });
        } catch (error) {
          console.error('퀴즈 데이터를 로드하는 중 오류 발생:', error);
          toast.error('데이터 로드 실패');
        }
      };

      fetchQuizData();
    }
  }, [id]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    if (image) formData.append('image', image);

    try {
      const response = await axios.post('/api/quiz', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Cache-Control': 'no-cache',
        },
      });

      if (response.status === 200) {
        toast.success('퀴즈가 성공적으로 추가되었습니다.');
        setData({
          question: '',
          option1: '',
          option2: '',
          option3: '',
          option4: '',
          ans: '1',
          quest_type: 'TOPIK',
          type: 'TXT',
          pic_path: '',
        });
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error('퀴즈 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('서버 오류가 발생했습니다.');
    }
  };

  const onUpdateHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`/api/quiz`, data, {
        params: { id: id },
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.status === 200) {
        toast.success('퀴즈가 성공적으로 수정되었습니다.');
        router.push('/admin/list');
      } else {
        toast.error('퀴즈 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('서버 오류가 발생했습니다.');
    }
  };

  const getGithubImageUrl = (picPath) => {
    if (!picPath) return null;
    return `https://raw.githubusercontent.com/drvince00/drvince-quiz/main/public${picPath}`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-4">{id ? '퀴즈 수정' : '퀴즈 추가'}</h1>
        <div className="flex justify-end mb-4">
          <Link href="/admin/list">
            <Image src="/list-icon.png" alt="List" width={32} height={32} />
          </Link>
        </div>
        <form onSubmit={id ? onUpdateHandler : onSubmitHandler} className="space-y-4">
          {!id && (
            <div className="mb-4">
              <div className="flex gap-8">
                <div className="flex items-center">
                  <Image
                    src={imagePreview || '/upload_area.png'}
                    alt="Upload"
                    width={180}
                    height={180}
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center items-start">
                  <div className="flex items-center">
                    <input
                      type="file"
                      id="image"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <label
                      htmlFor="image"
                      className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 inline-block"
                    >
                      이미지 선택
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="ml-2 flex items-center justify-center p-2"
                      >
                        <Image src="/stop.png" alt="Remove" width={20} height={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {id && data.pic_path && (
            <div className="mb-4">
              <Image
                src={getGithubImageUrl(data.pic_path)}
                alt="Quiz Image"
                width={200}
                height={200}
                className="object-cover"
                onError={(e) => {
                  console.error('이미지 로딩 실패:', data.pic_path);
                  e.target.src = '/no-image.png';
                }}
              />
            </div>
          )}

          <div className="flex items-start space-x-2">
            <label htmlFor="question" className="w-1/4 text-lg font-medium">
              문제
            </label>
            <textarea
              id="question"
              name="question"
              rows="2"
              className="flex-1 px-3 py-2 border rounded-md"
              value={data.question || ''}
              onChange={onChangeHandler}
              required
            />
          </div>

          {['option1', 'option2', 'option3', 'option4'].map((option, index) => (
            <div key={option} className="flex items-center space-x-2">
              <label htmlFor={option} className="w-1/4 text-lg font-medium">
                보기 {index + 1}
              </label>
              <input
                type="text"
                id={option}
                name={option}
                className="flex-1 px-3 py-2 border rounded-md"
                value={data[option] || ''}
                onChange={onChangeHandler}
                required
              />
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <label htmlFor="ans" className="w-1/4 text-lg font-medium">
              정답
            </label>
            <select
              id="ans"
              name="ans"
              className="flex-1 px-3 py-2 border rounded-md"
              value={data.ans}
              onChange={onChangeHandler}
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="quest_type" className="w-1/4 text-lg font-medium">
              문제 종류
            </label>
            <select
              id="quest_type"
              name="quest_type"
              className="flex-1 px-3 py-2 border rounded-md"
              value={data.quest_type}
              onChange={onChangeHandler}
            >
              {['TOPIK', 'FOOD', 'CULTURE'].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="type" className="w-1/4 text-lg font-medium">
              문제 유형
            </label>
            <select
              id="type"
              name="type"
              className="flex-1 px-3 py-2 border rounded-md"
              value={data.type}
              onChange={onChangeHandler}
              disabled
            >
              <option value="TXT">TEXT</option>
              <option value="PIC">PICTURE</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="pic_path" className="w-1/4 text-lg font-medium">
              파일명
            </label>
            <input
              type="text"
              id="pic_path"
              name="pic_path"
              className="flex-1 px-3 py-2 border rounded-md"
              value={data.pic_path}
              onChange={onChangeHandler}
              readOnly
            />
          </div>

          <div className="flex justify-center items-center mt-4">
            <button
              type="submit"
              className="w-1/4 font-bold text-center py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              {id ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
