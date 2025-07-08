import { User, UserDocument, UserDocumentWithoutPassword, UserDocumentWithPassword } from '../models/User';
import { CreateUserDto } from '../../../shared/types';

export class UserRepository {
  async create(userData: CreateUserDto): Promise<UserDocument> {
    const user = new User(userData);
    return await user.save();
  }

  async findById(id: string): Promise<UserDocumentWithoutPassword | null> {
    return await User.findById(id).select('-password') as UserDocumentWithoutPassword | null;
  }

  async findByEmail(email: string): Promise<UserDocumentWithPassword | null> {
    return await User.findOne({ email }).select('+password') as UserDocumentWithPassword | null;
  }

  async findByUsername(username: string): Promise<UserDocumentWithoutPassword | null> {
    return await User.findOne({ username }) as UserDocumentWithoutPassword | null;
  }

  async update(id: string, updateData: Partial<UserDocument>): Promise<UserDocumentWithoutPassword | null> {
    return await User.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    }).select('-password') as UserDocumentWithoutPassword | null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    users: UserDocumentWithoutPassword[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }) as unknown as Promise<UserDocumentWithoutPassword[]>,
      User.countDocuments()
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  async findByResetToken(token: string): Promise<UserDocument | null> {
    return await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
  }

  async findByEmailVerificationToken(token: string): Promise<UserDocument | null> {
    return await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });
  }

  async updatePassword(id: string, password: string): Promise<UserDocument | null> {
    const user = await User.findById(id);
    if (!user) return null;
    
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    return await user.save();
  }

  async verifyEmail(id: string): Promise<UserDocumentWithoutPassword | null> {
    return await User.findByIdAndUpdate(
      id,
      {
        isEmailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined
      },
      { new: true }
    ).select('-password') as UserDocumentWithoutPassword | null;
  }
}