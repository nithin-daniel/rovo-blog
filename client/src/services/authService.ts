import { apiService } from './api';
import { CreateUserDto, LoginDto, User } from '../../../shared/types';

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async register(userData: CreateUserDto): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', userData);
    if (response.success && response.data) {
      this.setAuthData(response.data);
    }
    return response.data!;
  }

  async login(loginData: LoginDto): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', loginData);
    if (response.success && response.data) {
      this.setAuthData(response.data);
    }
    return response.data!;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } finally {
      this.clearAuthData();
    }
  }

  async getProfile(): Promise<User> {
    const response = await apiService.get<{ user: User }>('/auth/profile');
    return response.data!.user;
  }

  async verifyEmail(token: string): Promise<User> {
    const response = await apiService.get<{ user: User }>(`/auth/verify-email?token=${token}`);
    return response.data!.user;
  }

  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<User> {
    const response = await apiService.post<{ user: User }>('/auth/reset-password', {
      token,
      password,
    });
    return response.data!.user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<User> {
    const response = await apiService.post<{ user: User }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data!.user;
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiService.post<{ token: string }>('/auth/refresh-token');
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data!;
  }

  private setAuthData(authData: AuthResponse): void {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const authService = new AuthService();