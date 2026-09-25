import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

const applyTheme = (t) => {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('roleflow_theme', t);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('roleflow_theme') || 'dark';
    applyTheme(saved);
    return saved;
  });

  const toggleTheme = (event) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const updateTheme = () => {
      applyTheme(next);
      setTheme(next);
    };

    const supportsViewTransition = typeof document.startViewTransition === 'function';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!supportsViewTransition || reduceMotion) {
      updateTheme();
      return;
    }

    // Use the toggle button as the origin so the new theme expands from the
    // top-right corner across the page toward the lower-left.
    const x = event?.clientX ?? window.innerWidth - 32;
    const y = event?.clientY ?? 28;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(updateTheme);
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 600,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
