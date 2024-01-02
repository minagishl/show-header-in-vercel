import './globals.css';
import { Inter as FontSans } from 'next/font/google';

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<head />
			<body>
				<div className='min-w-screen min-h-screen p-2'>{children}</div>
			</body>
		</html>
	);
}
