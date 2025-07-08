// MongoDB initialization script
db = db.getSiblingDB('blog_app');

// Create collections with indexes
db.createCollection('users');
db.createCollection('posts');
db.createCollection('categories');
db.createCollection('tags');
db.createCollection('comments');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });

db.posts.createIndex({ "slug": 1 }, { unique: true });
db.posts.createIndex({ "author": 1 });
db.posts.createIndex({ "status": 1 });
db.posts.createIndex({ "createdAt": -1 });
db.posts.createIndex({ "categories": 1 });
db.posts.createIndex({ "tags": 1 });

db.categories.createIndex({ "slug": 1 }, { unique: true });
db.tags.createIndex({ "slug": 1 }, { unique: true });

db.comments.createIndex({ "post": 1 });
db.comments.createIndex({ "author": 1 });
db.comments.createIndex({ "createdAt": -1 });

print('Database initialized successfully!');