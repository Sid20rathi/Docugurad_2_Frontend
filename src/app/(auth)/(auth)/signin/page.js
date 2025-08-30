"use client"
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ArrowLeft } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // --- UPDATED LOCALSTORAGE LOGIC ---
      // 1. Clear any old data from a previous session
      localStorage.clear();

      // 2. Set the new items from the successful API response
      localStorage.setItem("user_type", data.user_type);
      localStorage.setItem("user_email", data.email);

      // 3. Combine first and last name and save it as "user_name"
      const fullName = `${data.firstName} ${data.lastName}`;
      localStorage.setItem("user_name", fullName);
      // --- END OF UPDATES ---

      // Redirect to the next page
      router.push('/verification');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In | DocuGuard</title>
        <meta name="description" content="Sign in to your DocuGuard account." />
      </Head>

      <div className="flex flex-col md:flex-row min-h-screen">
       
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 text-white p-8 md:p-12">
          <div className="w-full max-w-md">
            <div className="text-4xl font-bold mb-4 cursor-pointer text-white   " onClick={() => router.push('/')}>DocuGuard</div>
            <p className="text-3xl lg:text-4xl font-semibold leading-tight">
              Welcome back. Your secure documents await.
            </p>
            <div className="h-1 w-20 bg-yellow-400 mt-8"></div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white p-8 md:p-12">
        <div className='flex justify-start items-start pr-64 pb-7'>
        <button onClick={() => router.push('/')} className="flex items-center  gap-2 text-gray-600 hover:text-black transition-colors group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to landing page</span>
            </button>
        </div>
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">
              Welcome Back!
            </h2>
            <p className="text-gray-500 mb-8">
              Please enter your details to sign in.
            </p>

            {error && (
              <p className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 transition"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-lg text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200 disabled:bg-yellow-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'SIGN IN'}
                </button>
              </div>
            </form>

          
          </div>
        </div>
      </div>
    </>
  );
}
