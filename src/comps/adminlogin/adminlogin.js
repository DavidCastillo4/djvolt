'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const AdminLogin = () => {
 const router = useRouter();
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);

 async function handleSubmit(event) {
  event.preventDefault();
  setError('');
  setIsSubmitting(true);

  try {
   const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
   });

   if (!response.ok) {
    const result = await response.json();
    setError(result.message || 'Unable to sign in.');
    return;
   }

   router.push('/admin/dashboard');
   router.refresh();
  } catch {
   setError('Unable to sign in. Please try again.');
  } finally {
   setIsSubmitting(false);
  }
 }

 return (
  <main className="admin-login-page">
   <section className="admin-login-card" aria-labelledby="admin-login-title">
    <h1 id="admin-login-title">Admin Login</h1>
    <form onSubmit={handleSubmit} className="admin-login-form">
     <label htmlFor="admin-password">Password</label>
     <input
      id="admin-password"
      name="password"
      type="password"
      value={password}
      onChange={(event) => setPassword(event.target.value)}
      autoComplete="current-password"
      required
      autoFocus
     />

     {error && <div className="admin-login-error" role="alert">{error}</div>}

     <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Signing In...' : 'Sign In'}
     </button>
    </form>
   </section>
  </main>
 );
};
