"use client"
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { FaQuoteLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

export default function SignUpPage() {
 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const[number,setNumber]=useState('')
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password,number }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      router.push('/signin');
      toast.success('Account created successfully! Please sign in.');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <Head>
        <title>Sign Up | DocuGuard</title>
        <meta name="description" content="Create your DocuGuard account to start verifying documents with AI." />
      </Head>

      <div className="flex flex-col md:flex-row min-h-screen">
 
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-black text-white p-8 md:p-12">
          <div className="w-full max-w-md">
            <div className="text-2xl font-bold mb-4 cursor-pointer" onClick={() => router.push('/')}>DocuGuard</div>
            <FaQuoteLeft className="text-yellow-400 text-4xl mb-6" />
            <p className="text-3xl lg:text-4xl font-semibold leading-tight">
              Sign up to start detecting fraud, verifying authenticity, and extracting critical elements like signatures, stamps, and tampering using AI.
            </p>
            <div className="h-1 w-20 bg-yellow-400 mt-8"></div>
          </div>
        </div>

       
        
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white p-8 md:p-12">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">
              Create an Account
            </h2>
            <p className="text-gray-500 mb-8">
              Join us to fight fraud and forgery with AI.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
             
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
                <div className="w-full">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 transition"
                      placeholder="Enter your first name"
                    />
                  </div>
                </div>
                <div className="w-full">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 transition"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="number"
                    name="number"
                    type="number"
                    autoComplete="number"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 transition"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 transition"
                    placeholder="Minimum 8 characters"
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

              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200 disabled:bg-yellow-200 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'SIGN UP'}
                  <Toaster
                position="bottom-right"
                    reverseOrder={false}
                    toastOptions={{
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                    }}
            />
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{' '}
                <a className="font-medium text-yellow-600 hover:text-yellow-500 cursor-pointer" onClick={() => router.push('/signin')}>
                  Sign In
                </a>
            </p>
          </div>
        </div>
      </div>
      </>
      
    
  );
}