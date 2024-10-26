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
  title: 'Topik Quiz',
  description: 'Generated by create next app',
};

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
