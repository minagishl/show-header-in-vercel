'use strict';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { headers } from 'next/headers';

export const runtime = 'edge';

export const List = () => {
  const headersJson = headers(); // headers()からJSONを取得
  const headersData = (headersJson as any).headers; // headersプロパティを取得

  const headersList = Object.keys(headersData)
    .map((key) => {
      return `| ${key} | ${headersData[key]} |`; // headersDataから各ヘッダーの値を取得
    })
    .join('\n');

  const markdownTable =
    '| VAR                  | Value                |\n' +
    '| -------------------- | -------------------- |\n' +
    headersList;

  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownTable}</ReactMarkdown>;
};
