import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <div className="markdown-body">
          <article className="prose max-w-full p-2">{children}</article>
        </div>
      </body>
    </html>
  );
}
