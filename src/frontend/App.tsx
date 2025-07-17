import React, { FormEventHandler, useState } from 'react';
import { useMentraAuth } from '@mentra/react';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import NotAuthenticatedScreen from './components/NotAuthenticatedScreen';
import FireboardAuthForm from './components/FireboardAuthForm';
import FireboardAuthenticatedScreen from './components/FireboardAuthenticatedScreen';

function App(): React.JSX.Element {
  const { userId, isLoading, error, isAuthenticated } = useMentraAuth();
  const [isFireboardAuthenticated, setIsFireboardAuthenticated] = useState(false);

  React.useEffect(() => {
    // Check if user is authenticated with Fireboard
    fetch('/api/login', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(async (response) => {
        if (!response.ok) {
          setIsFireboardAuthenticated(false);
          return;
        }
        const data = await response.json();
        setIsFireboardAuthenticated(!!data?.authenticated);
      })
      .catch(() => {
        setIsFireboardAuthenticated(false);
      });
  }, []);

  const handleFireboardAuthSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');

    fetch('/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(
            errorBody?.error?.detail ||
            errorBody?.error ||
            JSON.stringify(errorBody)
          );
        }
        setIsFireboardAuthenticated(true);
      })
      .catch((err) => {
        alert(err.message || err);
      });
  };

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (!isAuthenticated || !userId) return <NotAuthenticatedScreen />;
  if (!isFireboardAuthenticated) return <FireboardAuthForm onSubmit={handleFireboardAuthSubmit} />;
  return <FireboardAuthenticatedScreen />;
}

export default App;