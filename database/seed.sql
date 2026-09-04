-- AsifTechGlobal Initial Seed Data

-- Insert Sample Blogs
INSERT OR IGNORE INTO blogs (title, slug, category, excerpt, content, image, author, read_time) VALUES
('The Future of AI in Enterprise Web Development', 'future-of-ai-enterprise-web-development', 'AI & ML', 'Explore how artificial intelligence is transforming modern web development workflows, automation, and user experiences.', 'Artificial Intelligence is revolutionizing modern web applications. From intelligent chatbots and personalized user interfaces to automated test generation and backend optimization, modern businesses are accelerating growth through AI-native architectures. At AsifTechGlobal, we leverage state-of-the-art LLMs, predictive analytics, and automated cloud pipelines to deliver cutting-edge digital experiences.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', 'Asif Tech Global', '5 min read'),
('Building Scalable Cloud Architectures with Microservices', 'building-scalable-cloud-architectures', 'Cloud', 'A comprehensive architectural guide to decoupling monoliths into resilient, autoscaling microservices.', 'Microservices allow distributed teams to build, deploy, and scale application components independently. With containerization tools like Docker and orchestration via Kubernetes, high-traffic web applications achieve 99.99% availability while reducing server costs.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800', 'Asif Tech Global', '7 min read'),
('Modern Cybersecurity Practices for Digital Businesses', 'modern-cybersecurity-practices', 'Cybersecurity', 'Protecting customer privacy, securing API endpoints, and implementing zero-trust network models.', 'Security is not an afterthought; it must be built into the core DNA of your software. Learn how automated penetration testing, encrypted communications, and role-based access control protect critical enterprise assets.', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', 'Asif Tech Global', '4 min read');

-- Insert Sample Portfolio Projects
INSERT OR IGNORE INTO portfolio (title, category, description, tech_stack, client, demo_link, github_link, image) VALUES
('Global FinTech Mobile Platform', 'mobile', 'Next-generation cross-platform mobile wallet with biometric security, real-time FX transfers, and instant notifications.', 'Flutter, Node.js, PostgreSQL, Stripe', 'Apex Financial Inc.', 'https://github.com/Asif6967/asiftechglobalwebsite2', 'https://github.com/Asif6967/asiftechglobalwebsite2', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800'),
('Enterprise ERP & Cloud Dashboard', 'web', 'Comprehensive ERP software handling inventory tracking, multi-currency invoicing, and real-time operational analytics.', 'React, Node.js, Express, SQLite/MySQL', 'LogiTrans Global', 'https://github.com/Asif6967/asiftechglobalwebsite2', 'https://github.com/Asif6967/asiftechglobalwebsite2', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'),
('AI Customer Intelligence Engine', 'ai', 'Predictive analytics pipeline providing automated churn detection, sentiment analysis, and smart recommendation flows.', 'Python, FastAPI, TensorFlow, Docker', 'AeroCorp Media', 'https://github.com/Asif6967/asiftechglobalwebsite2', 'https://github.com/Asif6967/asiftechglobalwebsite2', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'),
('Distributed Multi-Cloud Kubernetes Cluster', 'cloud', 'Zero-downtime multi-region cloud deployment handling over 10M daily requests with automated failover.', 'Kubernetes, Terraform, AWS, GCP', 'OmniHost Cloud', 'https://github.com/Asif6967/asiftechglobalwebsite2', 'https://github.com/Asif6967/asiftechglobalwebsite2', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800');

-- Insert Sample Subscribers
INSERT OR IGNORE INTO subscribers (email) VALUES
('client.partner@globaltech.com'),
('enterprise.lead@innovate.org');

-- Insert Sample Inquiries
INSERT OR IGNORE INTO contacts (name, email, phone, company, service, budget, timeline, message, status) VALUES
('Alexander Wright', 'alex.wright@vertexsolutions.io', '+1 555-0199', 'Vertex Solutions', 'Web Development', '$10,000 - $25,000', '1-3 Months', 'We would love to redesign our customer portal into a high-performance dynamic web application with real-time analytics.', 'new');

INSERT OR IGNORE INTO testimonials (name, role, company, quote, rating) VALUES
('Demo Client', 'Founder', 'Replace with your client', 'Demo proof — replace this quote from the admin panel before launch.', 5);

INSERT OR IGNORE INTO faqs (question, answer, sort_order) VALUES
('How do we start a project?', 'Share your goals, timeline, and budget through the project brief. We will reply with a practical next-step plan.', 1),
('Do you work with global and Indian teams?', 'Yes. Engagements can be structured for global enterprises, startups, and growing SMEs.', 2),
('Can the website content be managed without code?', 'Yes. The admin control center is being extended so content can be edited without developer support.', 3);

INSERT OR IGNORE INTO service_packages (name, audience, description, price_label, features, featured) VALUES
('Launch Sprint', 'Startups and SMEs', 'A focused digital launch for teams validating a product or service.', 'Custom quote', 'Strategy|UX direction|Responsive build|Launch support', 0),
('Growth System', 'Scaling businesses', 'A conversion-led web platform with analytics, content, and ongoing iteration.', 'Custom quote', 'Discovery|Design system|Full-stack delivery|Growth roadmap', 1),
('Enterprise Partner', 'Global B2B teams', 'A senior product engineering partner for complex digital transformation.', 'Custom quote', 'Architecture|Security review|Integrations|Dedicated support', 0);
