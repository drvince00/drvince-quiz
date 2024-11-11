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
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-5S66HQDXH4"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5S66HQDXH4');
            `,
          }}
        />
        {/* End Google Analytics */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={outfit.className}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
