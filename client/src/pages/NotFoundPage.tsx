import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import Button from '../components/Common/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/" className="block">
            <Button
              className="w-full"
              leftIcon={<Home className="w-5 h-5" />}
            >
              Go Home
            </Button>
          </Link>
          
          <Link to="/search" className="block">
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<Search className="w-5 h-5" />}
            >
              Search Posts
            </Button>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full"
          >
            <Button
              variant="ghost"
              className="w-full"
              leftIcon={<ArrowLeft className="w-5 h-5" />}
            >
              Go Back
            </Button>
          </button>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you think this is an error, please{' '}
            <Link
              to="/contact"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;