import { Post, PostDocument } from '../models/Post';
import { CreatePostDto, UpdatePostDto, SearchFilters } from '../../shared/types';
import { Category } from '../models/Category';
import { Tag } from '../models/Tag';

export class PostRepository {
  async create(postData: CreatePostDto, authorId: string): Promise<PostDocument> {
    // Handle categories and tags
    const categoryIds = await this.handleCategories(postData.categories || []);
    const tagIds = await this.handleTags(postData.tags || []);

    const post = new Post({
      ...postData,
      author: authorId,
      categories: categoryIds,
      tags: tagIds
    });

    const savedPost = await post.save();
    
    // Update category and tag post counts
    await this.updateCategoryPostCounts(categoryIds);
    await this.updateTagPostCounts(tagIds);

    return await this.findById(savedPost._id.toString());
  }

  async findById(id: string): Promise<PostDocument | null> {
    return await Post.findById(id)
      .populate('author', 'username firstName lastName avatar')
      .populate('categories', 'name slug color')
      .populate('tags', 'name slug');
  }

  async findBySlug(slug: string): Promise<PostDocument | null> {
    return await Post.findOne({ slug })
      .populate('author', 'username firstName lastName avatar')
      .populate('categories', 'name slug color')
      .populate('tags', 'name slug');
  }

  async update(id: string, updateData: UpdatePostDto): Promise<PostDocument | null> {
    const post = await Post.findById(id);
    if (!post) return null;

    // Handle categories and tags if provided
    if (updateData.categories) {
      const oldCategoryIds = post.categories;
      const newCategoryIds = await this.handleCategories(updateData.categories);
      updateData.categories = newCategoryIds as any;
      
      // Update post counts
      await this.updateCategoryPostCounts(oldCategoryIds, -1);
      await this.updateCategoryPostCounts(newCategoryIds);
    }

    if (updateData.tags) {
      const oldTagIds = post.tags;
      const newTagIds = await this.handleTags(updateData.tags);
      updateData.tags = newTagIds as any;
      
      // Update post counts
      await this.updateTagPostCounts(oldTagIds, -1);
      await this.updateTagPostCounts(newTagIds);
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const post = await Post.findById(id);
    if (!post) return false;

    // Update category and tag post counts
    await this.updateCategoryPostCounts(post.categories, -1);
    await this.updateTagPostCounts(post.tags, -1);

    const result = await Post.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(filters: SearchFilters = {}): Promise<{
    posts: PostDocument[];
    total: number;
    pages: number;
  }> {
    const {
      query,
      category,
      tag,
      author,
      status = 'published',
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = filters;

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Build query
    const queryObj: any = { status };

    if (query) {
      queryObj.$text = { $search: query };
    }

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        queryObj.categories = categoryDoc._id;
      }
    }

    if (tag) {
      const tagDoc = await Tag.findOne({ slug: tag });
      if (tagDoc) {
        queryObj.tags = tagDoc._id;
      }
    }

    if (author) {
      queryObj.author = author;
    }

    if (dateFrom || dateTo) {
      queryObj.createdAt = {};
      if (dateFrom) queryObj.createdAt.$gte = new Date(dateFrom);
      if (dateTo) queryObj.createdAt.$lte = new Date(dateTo);
    }

    const [posts, total] = await Promise.all([
      Post.find(queryObj)
        .populate('author', 'username firstName lastName avatar')
        .populate('categories', 'name slug color')
        .populate('tags', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Post.countDocuments(queryObj)
    ]);

    return {
      posts,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  async incrementViewCount(id: string): Promise<void> {
    await Post.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  }

  async incrementLikeCount(id: string): Promise<void> {
    await Post.findByIdAndUpdate(id, { $inc: { likeCount: 1 } });
  }

  async decrementLikeCount(id: string): Promise<void> {
    await Post.findByIdAndUpdate(id, { $inc: { likeCount: -1 } });
  }

  async incrementCommentCount(id: string): Promise<void> {
    await Post.findByIdAndUpdate(id, { $inc: { commentCount: 1 } });
  }

  async decrementCommentCount(id: string): Promise<void> {
    await Post.findByIdAndUpdate(id, { $inc: { commentCount: -1 } });
  }

  private async handleCategories(categoryNames: string[]): Promise<string[]> {
    const categoryIds: string[] = [];
    
    for (const name of categoryNames) {
      let category = await Category.findOne({ name });
      if (!category) {
        category = new Category({ name });
        await category.save();
      }
      categoryIds.push(category._id.toString());
    }
    
    return categoryIds;
  }

  private async handleTags(tagNames: string[]): Promise<string[]> {
    const tagIds: string[] = [];
    
    for (const name of tagNames) {
      let tag = await Tag.findOne({ name });
      if (!tag) {
        tag = new Tag({ name });
        await tag.save();
      }
      tagIds.push(tag._id.toString());
    }
    
    return tagIds;
  }

  private async updateCategoryPostCounts(categoryIds: any[], increment: number = 1): Promise<void> {
    await Category.updateMany(
      { _id: { $in: categoryIds } },
      { $inc: { postCount: increment } }
    );
  }

  private async updateTagPostCounts(tagIds: any[], increment: number = 1): Promise<void> {
    await Tag.updateMany(
      { _id: { $in: tagIds } },
      { $inc: { postCount: increment } }
    );
  }
}