import { useEffect, useRef } from 'react';

export function useScrollToBottom<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const scrollToBottom = () => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  });

  return { ref, scrollToBottom };
} 