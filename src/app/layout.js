import { Inter } from 'next/font/google';
import './globals.css'; // Import global CSS
import {AuthProvider} from './context/AuthContext';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FarmConnect - Your Agricultural Management Hub',
  description: 'Manage contracts and cold storage bookings with ease',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
      <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}