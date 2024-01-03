'use client';

import { useState, useEffect } from 'react';

export default function AllowButton() {
  const [click, setClick] = useState(false);

  return (
    <button
      className={`w-full bg-zinc-950 py-3 transition-all duration-300 ease-in-out ${
        click ? 'text-zinc-300' : 'text-zinc-50'
      }`}
      onClick={() => setClick(true)}
      disabled={click}
    >
      <span className="text-lg font-medium">Allow</span>
    </button>
  );
}
