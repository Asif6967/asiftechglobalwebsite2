IF OBJECT_ID(N'dbo.contact_submissions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.contact_submissions (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_contact_submissions PRIMARY KEY,
        name NVARCHAR(150) NOT NULL,
        email NVARCHAR(255) NOT NULL,
        phone NVARCHAR(50) NULL,
        company NVARCHAR(150) NULL,
        service NVARCHAR(100) NULL,
        budget NVARCHAR(50) NULL,
        timeline NVARCHAR(50) NULL,
        message NVARCHAR(MAX) NOT NULL,
        status NVARCHAR(20) NOT NULL CONSTRAINT DF_contact_submissions_status DEFAULT 'new',
        created_at DATETIME2 NOT NULL CONSTRAINT DF_contact_submissions_created_at DEFAULT SYSUTCDATETIME()
    );
END;
GO

IF OBJECT_ID(N'dbo.blog_posts', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.blog_posts (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_blog_posts PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        slug NVARCHAR(255) NOT NULL CONSTRAINT UQ_blog_posts_slug UNIQUE,
        excerpt NVARCHAR(500) NULL,
        content NVARCHAR(MAX) NULL,
        category NVARCHAR(100) NULL,
        author NVARCHAR(150) NULL,
        image_url NVARCHAR(500) NULL,
        status NVARCHAR(20) NOT NULL CONSTRAINT DF_blog_posts_status DEFAULT 'draft',
        published_at DATETIME2 NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_blog_posts_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_blog_posts_updated_at DEFAULT SYSUTCDATETIME()
    );
END;
GO

IF OBJECT_ID(N'dbo.portfolio_projects', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.portfolio_projects (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_portfolio_projects PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        category NVARCHAR(100) NULL,
        client NVARCHAR(150) NULL,
        description NVARCHAR(MAX) NULL,
        image_url NVARCHAR(500) NULL,
        project_url NVARCHAR(500) NULL,
        technologies NVARCHAR(500) NULL,
        completed_on DATE NULL,
        featured BIT NOT NULL CONSTRAINT DF_portfolio_projects_featured DEFAULT 0,
        sort_order INT NOT NULL CONSTRAINT DF_portfolio_projects_sort_order DEFAULT 0,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_portfolio_projects_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_portfolio_projects_updated_at DEFAULT SYSUTCDATETIME()
    );
END;
GO

IF OBJECT_ID(N'dbo.admin_users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.admin_users (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_admin_users PRIMARY KEY,
        username NVARCHAR(100) NOT NULL CONSTRAINT UQ_admin_users_username UNIQUE,
        email NVARCHAR(255) NULL,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) NOT NULL CONSTRAINT DF_admin_users_role DEFAULT 'admin',
        created_at DATETIME2 NOT NULL CONSTRAINT DF_admin_users_created_at DEFAULT SYSUTCDATETIME(),
        last_login_at DATETIME2 NULL
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_contact_submissions_status_created_at' AND object_id = OBJECT_ID(N'dbo.contact_submissions'))
    CREATE INDEX IX_contact_submissions_status_created_at ON dbo.contact_submissions(status, created_at);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_blog_posts_status_published_at' AND object_id = OBJECT_ID(N'dbo.blog_posts'))
    CREATE INDEX IX_blog_posts_status_published_at ON dbo.blog_posts(status, published_at);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_portfolio_projects_category' AND object_id = OBJECT_ID(N'dbo.portfolio_projects'))
    CREATE INDEX IX_portfolio_projects_category ON dbo.portfolio_projects(category);
GO
