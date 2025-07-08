import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Heart, MessageCircle, Share2, Edit, Trash2, Calendar, Clock, User, Tag } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { postService } from '../services/postService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const PostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  const { data: post, isLoading, error } = useQuery(
    ['post', slug],
    () => postService.getPostBySlug(slug!),
    {
      enabled: !!slug,
      onSuccess: () => {
        // Check if user has liked this post
        // This would typically come from the API
        setIsLiked(false);
      }
    }
  );

  const deleteMutation = useMutation(
    () => postService.deletePost(post!._id),
    {
      onSuccess: () => {
        toast.success('Post deleted successfully');
        navigate('/dashboard');
        queryClient.invalidateQueries('posts');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to delete post');
      }
    }
  );

  const likeMutation = useMutation(
    () => postService.likePost(post!._id),
    {
      onSuccess: () => {
        setIsLiked(!isLiked);
        queryClient.invalidateQueries(['post', slug]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to like post');
      }
    }
  );

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post!.title,
          text: post!.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Post not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // const postData = post;
  const isAuthor = user?._id === post.author._id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
          {post.featuredImage && (
            <div className="aspect-video w-full">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {post.categories.map((category: any) => (
                  <Link
                    key={category._id}
                    to={`/category/${category.slug}`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              
              {isAuthor && (
                <div className="flex items-center space-x-2">
                  <Link to={`/edit-post/${post._id}`}>
                    <Button variant="ghost" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={handleDelete}
                    isLoading={deleteMutation.isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {post.excerpt}
            </p>

            {/* Author and Meta Info */}
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center space-x-4">
                <Link
                  to={`/profile/${post.author.username}`}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.author.firstName} {post.author.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{post.author.username}
                    </p>
                  </div>
                </Link>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div 
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: any) => (
                <Link
                  key={tag._id}
                  to={`/search?tag=${tag.slug}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-red-500' : ''}`} />}
                onClick={() => likeMutation.mutate()}
                isLoading={likeMutation.isLoading}
                className={isLiked ? 'text-red-500 hover:text-red-600' : ''}
              >
                {post.likeCount} {post.likeCount === 1 ? 'Like' : 'Likes'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<MessageCircle className="w-5 h-5" />}
              >
                {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Share2 className="w-5 h-5" />}
              onClick={handleShare}
            >
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;