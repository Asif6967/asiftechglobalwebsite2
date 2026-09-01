-- Change the default admin password immediately after the first login.
-- The hash below is for the temporary password: ChangeMe123!

IF NOT EXISTS (SELECT 1 FROM dbo.admin_users WHERE username = N'admin')
BEGIN
    INSERT INTO dbo.admin_users (username, email, password_hash, role)
    VALUES (N'admin', N'admin@asiftechglobal.com',
        N'$2a$10$nhTOSlUGt/aHHR5rmPK1TulCAPJ7gcq3a3kD09zstTkc/elfYEZy.', N'admin');
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.blog_posts WHERE slug = N'future-of-artificial-intelligence-in-2024')
    INSERT INTO dbo.blog_posts (title, slug, excerpt, content, category, author, status, published_at)
    VALUES (N'The Future of Artificial Intelligence in 2024', N'future-of-artificial-intelligence-in-2024',
        N'Explore the groundbreaking developments in AI technology and how they are transforming industries worldwide.',
        N'Generative AI and machine learning continue to transform industries worldwide.',
        N'AI & ML', N'AsifTechGlobal Team', N'published', '2024-09-01T00:00:00');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.blog_posts WHERE slug = N'migrating-to-cloud-a-complete-guide')
    INSERT INTO dbo.blog_posts (title, slug, excerpt, content, category, author, status, published_at)
    VALUES (N'Migrating to Cloud: A Complete Guide', N'migrating-to-cloud-a-complete-guide',
        N'Step-by-step approach to successfully migrate your business to cloud infrastructure.',
        N'Learn practical cloud migration strategies for AWS, Azure, and Google Cloud.',
        N'Cloud Computing', N'AsifTechGlobal Team', N'published', '2024-08-28T00:00:00');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.blog_posts WHERE slug = N'10-essential-cybersecurity-tips-for-businesses')
    INSERT INTO dbo.blog_posts (title, slug, excerpt, content, category, author, status, published_at)
    VALUES (N'10 Essential Cybersecurity Tips for Businesses', N'10-essential-cybersecurity-tips-for-businesses',
        N'Protect your business from cyber threats with these proven security strategies.',
        N'Essential security practices every organization should implement.',
        N'Cybersecurity', N'AsifTechGlobal Team', N'published', '2024-08-25T00:00:00');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.blog_posts WHERE slug = N'react-native-vs-flutter')
    INSERT INTO dbo.blog_posts (title, slug, excerpt, content, category, author, status, published_at)
    VALUES (N'React Native vs Flutter: Choosing the Right Framework', N'react-native-vs-flutter',
        N'Comprehensive comparison of React Native and Flutter for cross-platform mobile app development.',
        N'Compare the strengths of React Native and Flutter to choose the right framework.',
        N'Mobile Development', N'AsifTechGlobal Team', N'published', '2024-08-22T00:00:00');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.blog_posts WHERE slug = N'big-data-analytics-turning-data-into-insights')
    INSERT INTO dbo.blog_posts (title, slug, excerpt, content, category, author, status, published_at)
    VALUES (N'Big Data Analytics: Turning Data Into Insights', N'big-data-analytics-turning-data-into-insights',
        N'Learn how to leverage big data analytics to drive business decisions.',
        N'Discover tools, techniques, and real-world applications for analytics.',
        N'Data Analytics', N'AsifTechGlobal Team', N'published', '2024-08-20T00:00:00');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.blog_posts WHERE slug = N'web-development-trends-2024')
    INSERT INTO dbo.blog_posts (title, slug, excerpt, content, category, author, status, published_at)
    VALUES (N'Web Development Trends 2024', N'web-development-trends-2024',
        N'Explore the latest web development trends including serverless architecture and JAMstack.',
        N'Progressive web applications and modern deployment patterns are changing the web.',
        N'Web Development', N'AsifTechGlobal Team', N'published', '2024-08-18T00:00:00');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.portfolio_projects WHERE title = N'Global E-Commerce Platform')
    INSERT INTO dbo.portfolio_projects (title, category, description, technologies, featured, sort_order)
    VALUES (N'Global E-Commerce Platform', N'web',
        N'Built a scalable e-commerce platform serving 100,000+ users worldwide with advanced search and payment integration.',
        N'React, Node.js, MongoDB, AWS', 1, 1);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.portfolio_projects WHERE title = N'Fitness Tracking App')
    INSERT INTO dbo.portfolio_projects (title, category, description, technologies, sort_order)
    VALUES (N'Fitness Tracking App', N'mobile',
        N'Cross-platform fitness app with real-time tracking, social features, and AI-powered workout recommendations.',
        N'React Native, Firebase, Machine Learning', 2);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.portfolio_projects WHERE title = N'AI-Powered Chatbot')
    INSERT INTO dbo.portfolio_projects (title, category, description, technologies, featured, sort_order)
    VALUES (N'AI-Powered Chatbot', N'ai',
        N'Intelligent customer service chatbot using NLP, capable of handling 10,000+ daily conversations with 95% accuracy.',
        N'Python, TensorFlow, NLP, AWS Lambda', 1, 3);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.portfolio_projects WHERE title = N'Cloud Migration Project')
    INSERT INTO dbo.portfolio_projects (title, category, description, technologies, sort_order)
    VALUES (N'Cloud Migration Project', N'cloud',
        N'Successfully migrated enterprise infrastructure to AWS with 99.9% uptime and 40% cost reduction.',
        N'AWS, Docker, Kubernetes, Jenkins', 4);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.portfolio_projects WHERE title = N'Analytics Dashboard')
    INSERT INTO dbo.portfolio_projects (title, category, description, technologies, sort_order)
    VALUES (N'Analytics Dashboard', N'web',
        N'Real-time analytics dashboard providing insights for 200+ enterprise clients with custom visualizations.',
        N'Vue.js, D3.js, PostgreSQL, WebSocket', 5);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.portfolio_projects WHERE title = N'Retail Management System')
    INSERT INTO dbo.portfolio_projects (title, category, description, technologies, sort_order)
    VALUES (N'Retail Management System', N'mobile',
        N'Native iOS and Android app for retail chain with 500+ stores managing inventory, sales, and customer data.',
        N'Swift, Kotlin, SQLite, REST API', 6);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.portfolio_projects WHERE title = N'Image Recognition System')
    INSERT INTO dbo.portfolio_projects (title, category, description, technologies, featured, sort_order)
    VALUES (N'Image Recognition System', N'ai',
        N'Computer vision system for medical imaging with 98% accuracy in identifying abnormalities in X-rays.',
        N'Python, PyTorch, OpenCV, CUDA', 1, 7);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.portfolio_projects WHERE title = N'Blockchain Solution')
    INSERT INTO dbo.portfolio_projects (title, category, description, technologies, sort_order)
    VALUES (N'Blockchain Solution', N'web',
        N'Smart contract development and blockchain integration for supply chain transparency and verification.',
        N'Solidity, Ethereum, Web3.js, React', 8);
GO
