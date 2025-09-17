import { UserStory, RequirementElement } from '../types/requirements';

export const extractRequirements = (documentContent: string): Promise<UserStory[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock extraction logic - in reality, this would call an LLM API
      const userStories: UserStory[] = [
        {
          id: 'us-001',
          title: 'User Registration System',
          role: 'new customer',
          feature: 'create an account',
          benefit: 'I can make purchases and track my orders',
          priority: 'high',
          status: 'extracted',
          modules: ['Authentication', 'User Management'],
          elements: [
            {
              id: 'el-001',
              category: 'business-need',
              content: 'Increase customer retention by allowing users to save preferences and order history',
              sourceText: 'Business Need: Increase customer retention by allowing users to save preferences and order history.',
              confidence: 0.95,
              validated: false
            },
            {
              id: 'el-002',
              category: 'acceptance-criteria',
              content: 'User can register with email and password',
              sourceText: '- User can register with email and password',
              confidence: 0.98,
              validated: false
            },
            {
              id: 'el-003',
              category: 'acceptance-criteria',
              content: 'Email verification is required before account activation',
              sourceText: '- Email verification is required before account activation',
              confidence: 0.92,
              validated: false
            },
            {
              id: 'el-004',
              category: 'acceptance-criteria',
              content: 'Password must meet security requirements (8+ characters, mixed case, numbers)',
              sourceText: '- Password must meet security requirements (8+ characters, mixed case, numbers)',
              confidence: 0.89,
              validated: false
            },
            {
              id: 'el-005',
              category: 'dependencies',
              content: 'Email service integration, user database schema',
              sourceText: 'Dependencies: Email service integration, user database schema',
              confidence: 0.87,
              validated: false
            },
            {
              id: 'el-006',
              category: 'technical-details',
              content: 'Implement OAuth2 for social login options. Use bcrypt for password hashing. Rate limiting for registration attempts.',
              sourceText: 'Technical Details: Implement OAuth2 for social login options, Use bcrypt for password hashing, Rate limiting for registration attempts',
              confidence: 0.91,
              validated: false
            },
            {
              id: 'el-007',
              category: 'security',
              content: 'Password hashing with bcrypt, OAuth2 implementation, rate limiting',
              confidence: 0.85,
              validated: false
            }
          ]
        },
        {
          id: 'us-002',
          title: 'Product Search Functionality',
          role: 'customer',
          feature: 'search for products by name or category',
          benefit: 'I can quickly find what I need',
          priority: 'high',
          status: 'extracted',
          modules: ['Search Engine', 'Product Catalog'],
          elements: [
            {
              id: 'el-008',
              category: 'business-context',
              content: 'Improve user experience and reduce bounce rate',
              sourceText: 'Business Context: Improve user experience and reduce bounce rate',
              confidence: 0.94,
              validated: false
            },
            {
              id: 'el-009',
              category: 'acceptance-criteria',
              content: 'Search bar accepts text input and displays results in real-time',
              sourceText: '- Search bar accepts text input and displays results in real-time',
              confidence: 0.96,
              validated: false
            },
            {
              id: 'el-010',
              category: 'acceptance-criteria',
              content: 'Results can be filtered by price, rating, category',
              sourceText: '- Results can be filtered by price, rating, category',
              confidence: 0.93,
              validated: false
            },
            {
              id: 'el-011',
              category: 'out-of-scope',
              content: 'Voice search functionality',
              sourceText: 'Out of Scope: Voice search functionality',
              confidence: 0.99,
              validated: false
            },
            {
              id: 'el-012',
              category: 'testing',
              content: 'Unit tests for search algorithm, performance testing with large catalogs, A/B testing different layouts',
              sourceText: 'Testing: Unit tests for search algorithm, Performance testing with large product catalogs, A/B testing different search result layouts',
              confidence: 0.88,
              validated: false
            },
            {
              id: 'el-013',
              category: 'security',
              content: 'Input sanitization to prevent SQL injection',
              sourceText: 'Security: Input sanitization to prevent SQL injection',
              confidence: 0.97,
              validated: false
            },
            {
              id: 'el-014',
              category: 'definition-of-done',
              content: 'Feature tested in staging environment, performance benchmarks met, accessibility standards compliant',
              sourceText: 'Definition of Done: Feature tested in staging environment, Performance benchmarks met, Accessibility standards compliant, Documentation updated',
              confidence: 0.72,
              validated: false
            }
          ]
        }
      ];

      resolve(userStories);
    }, 2000);
  });
};