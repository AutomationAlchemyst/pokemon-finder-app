import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pokémon Finder',
  description: 'Find details about your favorite Pokémon',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* Add your footer here */}
        <footer>
          <p>
            Designed by Ath Thaariq Marthas For Zayd Imran. WorkFlowGuysLLP.  
            <a href="https://theworkflowguys.com" target="_blank" rel="noopener noreferrer">
              theworkflowguys.com
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}