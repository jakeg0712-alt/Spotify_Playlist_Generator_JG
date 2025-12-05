import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * User Service - Stores preferences
 */
class UserService {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.init();
  }

  /**
   * Initialize data directory and file
   */
  async init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      try {
        await fs.access(this.usersFile);
      } catch {
        // File doesn't exist, create it with empty array
        await fs.writeFile(this.usersFile, JSON.stringify([], null, 2));
      }
    } catch (error) {
      console.error('Error initializing user service:', error.message);
    }
  }

  /**
   * Load all users from file
   */
  async loadUsers() {
    try {
      const data = await fs.readFile(this.usersFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading users:', error.message);
      return [];
    }
  }

  /**
   * Save users to file
   */
  async saveUsers(users) {
    try {
      await fs.writeFile(this.usersFile, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error('Error saving users:', error.message);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId) {
    const users = await this.loadUsers();
    return users.find((u) => u.id === userId) || null;
  }

  /**
   * Create or update user
   */
  async saveUser(userData) {
    const users = await this.loadUsers();
    const existingIndex = users.findIndex((u) => u.id === userData.id);

    if (existingIndex >= 0) {
      // Update existing user
      users[existingIndex] = { ...users[existingIndex], ...userData };
    } else {
      // Create new user
      users.push({
        id: userData.id,
        playlistLength: 20,
        ...userData,
      });
    }

    await this.saveUsers(users);
    return users[existingIndex >= 0 ? existingIndex : users.length - 1];
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId, preferences) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const updatedUser = {
      ...user,
      ...preferences,
    };

    return await this.saveUser(updatedUser);
  }
}

export default new UserService();

