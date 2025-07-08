import { apiService } from './api';
import { Post, CreatePostDto, UpdatePostDto, SearchFilters, PaginatedResponse } from '../../../shared/types';

class PostService {
  async createPost(postData: CreatePostDto): Promise<Post> {
    const response = await apiService.post<{ post: Post }>('/posts', postData);
    return response.data!.post;
  }

  async getPosts(filters?: SearchFilters): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams();
    
    if (filters?.query) params.append('q', filters.query);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.tag) params.append('tag', filters.tag);
    if (filters?.author) params.append('author', filters.author);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
    if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/posts?${queryString}` : '/posts';
    
    const response = await apiService.get<PaginatedResponse<Post>>(url);
    return response.data!;
  }

  async getPostById(id: string): Promise<Post> {
    const response = await apiService.get<{ post: Post }>(`/posts/${id}`);
    return response.data!.post;
  }

  async getPostBySlug(slug: string): Promise<Post> {
    const response = await apiService.get<{ post: Post }>(`/posts/slug/${slug}`);
    return response.data!.post;
  }

  async updatePost(id: string, postData: UpdatePostDto): Promise<Post> {
    const response = await apiService.put<{ post: Post }>(`/posts/${id}`, postData);
    return response.data!.post;
  }

  async deletePost(id: string): Promise<void> {
    await apiService.delete(`/posts/${id}`);
  }

  async likePost(id: string): Promise<void> {
    await apiService.post(`/posts/${id}/like`);
  }

  async unlikePost(id: string): Promise<void> {
    await apiService.delete(`/posts/${id}/like`);
  }

  async getMyPosts(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Post>> {
    const response = await apiService.get<PaginatedResponse<Post>>(
      `/posts/my/posts?page=${page}&limit=${limit}`
    );
    return response.data!;
  }

  async searchPosts(query: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Post>> {
    const response = await apiService.get<PaginatedResponse<Post>>(
      `/posts?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.data!;
  }
}

export const postService = new PostService();