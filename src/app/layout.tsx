import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<head />
			<body>
				<div className='min-w-screen p-2'>{children}</div>
			</body>
		</html>
	);
}
