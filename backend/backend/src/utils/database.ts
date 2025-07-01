import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to initialize database with seed data
export async function initializeDatabase() {
  try {
    console.log('🗄️ Initializing database...');

    // Check if database is already initialized
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      console.log('✅ Database already initialized');
      return;
    }

    // Create default template
    await prisma.template.create({
      data: {
        name: 'Modern Professional',
        description: 'Clean and modern CV template perfect for tech professionals',
        structure: {
          sections: ['header', 'summary', 'experience', 'skills', 'education']
        },
        styles: {
          theme: 'modern',
          colors: {
            primary: '#2563eb',
            secondary: '#64748b'
          }
        }
      }
    });

    // Create another template
    await prisma.template.create({
      data: {
        name: 'Classic Executive',
        description: 'Traditional professional template for executive positions',
        structure: {
          sections: ['header', 'summary', 'experience', 'education', 'skills']
        },
        styles: {
          theme: 'classic',
          colors: {
            primary: '#1f2937',
            secondary: '#6b7280'
          }
        }
      }
    });

    console.log('✅ Database initialized with default data');
    
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// Function to test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export { prisma };