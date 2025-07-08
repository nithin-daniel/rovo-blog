import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return next(new AppError('Verification token is required', 400));
      }

      const user = await this.authService.verifyEmail(token);
      
      res.json({
        success: true,
        message: 'Email verified successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return next(new AppError('Email is required', 400));
      }

      const result = await this.authService.forgotPassword(email);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return next(new AppError('Token and password are required', 400));
      }

      const user = await this.authService.resetPassword(token, password);
      
      res.json({
        success: true,
        message: 'Password reset successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return next(new AppError('Current password and new password are required', 400));
      }

      const user = await this.authService.changePassword(
        req.user._id,
        currentPassword,
        newPassword
      );
      
      res.json({
        success: true,
        message: 'Password changed successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.refreshToken(req.user._id);
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        data: { user: req.user }
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In a real application, you might want to blacklist the token
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}