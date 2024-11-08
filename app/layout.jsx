import Head from 'next/head';
import { Outfit } from 'next/font/google';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'K-Quiz Cat',
  description: 'Quiz to Korea and Learn Topik',
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={outfit.className}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
