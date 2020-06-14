import React from 'react';

export const App: React.FC = () => {
  React.useEffect(() => {
    const sse = new EventSource('http://localhost:3000/');
    sse.onopen = (e) => {
      console.debug('opened', e);
    };
    sse.onerror = (e) => {
      console.error(e);
    };
    sse.addEventListener('new-message', (ev) => {
      console.debug('ev', ev);
    });
  }, []);

  return <div>React</div>;
};
