import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, Users, ArrowRight } from 'lucide-react';
import { postService } from '../services/postService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import PostCard from '../components/Post/PostCard';
import Button from '../components/Common/Button';

const HomePage: React.FC = () => {
  const { data: postsData, isLoading, error } = useQuery(
    'recent-posts',
    () => postService.getPosts({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' })
  );

  const { data: trendingData, isLoading: trendingLoading } = useQuery(
    'trending-posts',
    () => postService.getPosts({ limit: 3, sortBy: 'viewCount', sortOrder: 'desc' })
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Failed to load posts. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Share Your Stories,
              <br />
              <span className="text-primary-600 dark:text-primary-400">
                Inspire the World
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Join our community of writers and readers. Create beautiful blog posts,
              discover amazing content, and connect with like-minded people.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Start Writing
                </Button>
              </Link>
              <Link to="/search">
                <Button variant="outline" size="lg">
                  Explore Posts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg mx-auto mb-4">
                <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                10,000+
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Active Writers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                50,000+
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Published Posts</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                1M+
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Monthly Readers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Posts */}
      {!trendingLoading && trendingData?.data && trendingData.data.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Trending Posts
              </h2>
              <Link to="/search?sort=viewCount">
                <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trendingData.data.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Recent Posts
            </h2>
            <Link to="/search">
              <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All
              </Button>
            </Link>
          </div>
          {postsData?.data && postsData.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {postsData.data.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Be the first to share your story with the community.
              </p>
              <Link to="/create-post">
                <Button>Create Your First Post</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 dark:bg-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Blogging Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of writers who are already sharing their stories and building their audience.
          </p>
          <Link to="/register">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-100"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;