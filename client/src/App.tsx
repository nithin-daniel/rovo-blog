import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

// Layout Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostDetailPage from './pages/PostDetailPage';
// import CreatePostPage from './pages/CreatePostPage';
// import EditPostPage from './pages/EditPostPage';
// import ProfilePage from './pages/ProfilePage';
// import DashboardPage from './pages/DashboardPage';
// import SearchPage from './pages/SearchPage';
// import CategoryPage from './pages/CategoryPage';
import NotFoundPage from './pages/NotFoundPage';

// Styles
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Apply theme on mount
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/post/:slug" element={<PostDetailPage />} />
              {/* TODO: Implement these pages */}
              <Route path="/search" element={<div className="p-8 text-center">Search Page - Coming Soon</div>} />
              <Route path="/category/:slug" element={<div className="p-8 text-center">Category Page - Coming Soon</div>} />
              <Route path="/profile/:username" element={<div className="p-8 text-center">Profile Page - Coming Soon</div>} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div className="p-8 text-center">Dashboard - Coming Soon</div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-post"
                element={
                  <ProtectedRoute>
                    <div className="p-8 text-center">Create Post - Coming Soon</div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-post/:id"
                element={
                  <ProtectedRoute>
                    <div className="p-8 text-center">Edit Post - Coming Soon</div>
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:bg-gray-800 dark:text-white',
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;