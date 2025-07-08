import { UserRepository } from '../repositories/UserRepository';
import { CreateUserDto, LoginDto } from '../../../shared/types';
import { generateToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { EmailService } from './EmailService';
import crypto from 'crypto';

export class AuthService {
  private userRepository: UserRepository;
  private emailService: EmailService;

  constructor() {
    this.userRepository = new UserRepository();
    this.emailService = new EmailService();
  }

  async register(userData: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const existingUsername = await this.userRepository.findByUsername(userData.username);
    if (existingUsername) {
      throw new AppError('Username is already taken', 400);
    }

    // Create user
    const user = await this.userRepository.create(userData);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    // Generate JWT token
    const token = generateToken({ id: user._id });

    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        preferences: user.preferences
      },
      token
    };
  }

  async login(loginData: LoginDto) {
    const { email, password } = loginData;

    // Find user with password
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = generateToken({ id: user._id });

    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        preferences: user.preferences
      },
      token
    };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findByEmailVerificationToken(token);
    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    const verifiedUser = await this.userRepository.verifyEmail(user._id.toString());
    return verifiedUser;
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('No user found with this email address', 404);
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset email
    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const updatedUser = await this.userRepository.updatePassword(user._id.toString(), newPassword);
    return updatedUser;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findByEmail((await this.userRepository.findById(userId))?.email || '');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const updatedUser = await this.userRepository.updatePassword(userId, newPassword);
    return updatedUser;
  }

  async refreshToken(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const token = generateToken({ id: user._id });
    return { token };
  }
}