-- Sample data for dashboard testing
-- Run this in your database to populate with test data

-- First, get the admin user ID
DO $$
DECLARE
    admin_user_id UUID;
    regular_user_id UUID;
    post1_id UUID;
    post2_id UUID;
    post3_id UUID;
BEGIN
    -- Get admin user
    SELECT id INTO admin_user_id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin') LIMIT 1;
    
    -- Get regular user
    SELECT id INTO regular_user_id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'user') LIMIT 1;
    
    -- Create sample posts
    INSERT INTO posts (id, author_id, title, slug, content, excerpt, status, published_at, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), admin_user_id, 'Getting Started with Next.js 14', 'getting-started-nextjs-14', 'Next.js 14 introduces many new features including the App Router, Server Components, and improved performance. This guide will walk you through the key improvements and how to leverage them in your projects.', 'Learn about the latest features in Next.js 14 and how to use them effectively.', 'published', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
    RETURNING id INTO post1_id;
    
    INSERT INTO posts (id, author_id, title, slug, content, excerpt, status, published_at, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), admin_user_id, 'Advanced TypeScript Patterns', 'advanced-typescript-patterns', 'TypeScript offers powerful type system features that can help you write more maintainable and robust code. In this article, we explore advanced patterns like conditional types, mapped types, and utility types.', 'Explore advanced TypeScript patterns for better code organization and type safety.', 'published', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
    RETURNING id INTO post2_id;
    
    INSERT INTO posts (id, author_id, title, slug, content, excerpt, status, published_at, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), admin_user_id, 'Building Scalable APIs', 'building-scalable-apis', 'API design is crucial for scalability and maintainability. Learn about RESTful principles, authentication, rate limiting, and best practices for building APIs that can handle high traffic.', 'Best practices for building scalable and maintainable APIs.', 'published', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days')
    RETURNING id INTO post3_id;
    
    -- Create sample analytics data
    INSERT INTO post_analytics (post_id, date, views_count, likes_count, comments_count)
    VALUES 
        (post1_id, CURRENT_DATE, 150, 25, 8),
        (post1_id, CURRENT_DATE - INTERVAL '1 day', 120, 20, 6),
        (post1_id, CURRENT_DATE - INTERVAL '2 days', 100, 15, 4),
        (post2_id, CURRENT_DATE, 80, 12, 3),
        (post2_id, CURRENT_DATE - INTERVAL '1 day', 60, 8, 2);
    
    -- Create sample likes
    INSERT INTO likes (id, post_id, user_id, created_at)
    VALUES 
        (gen_random_uuid(), post1_id, regular_user_id, NOW() - INTERVAL '1 day'),
        (gen_random_uuid(), post2_id, regular_user_id, NOW() - INTERVAL '3 days');
    
    -- Create sample comments
    INSERT INTO comments (id, content, post_id, author_id, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), 'Great article! Very helpful for beginners.', post1_id, regular_user_id, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
        (gen_random_uuid(), 'Thanks for sharing these insights!', post2_id, regular_user_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');
    
    RAISE NOTICE 'Sample data created successfully!';
    RAISE NOTICE 'Post 1 ID: %', post1_id;
    RAISE NOTICE 'Post 2 ID: %', post2_id;
    RAISE NOTICE 'Post 3 ID: %', post3_id;
END $$; 