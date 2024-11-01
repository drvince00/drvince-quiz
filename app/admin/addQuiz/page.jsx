'use client';

import { Suspense } from 'react';
import AddQuizContent from '@/app/components/admin/AddQuizContent';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddQuizContent />
    </Suspense>
  );
}