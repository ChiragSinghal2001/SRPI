import { User, UserRole, SignupData, LoginCredentials } from '../types/auth';
import { syncLoadJsonData, loadJsonData, saveJsonData } from './jsonStorage';

export const SEEDED_USERS: User[] = syncLoadJsonData<User[]>('users');

let cachedUsers: User[] = syncLoadJsonData<User[]>('users');

// Kick off async load from disk .json file on app startup
loadJsonData<User[]>('users').then((users) => {
  if (users && users.length > 0) {
    cachedUsers = users;
  }
});

export const authService = {
  getUsers(): User[] {
    const latest = syncLoadJsonData<User[]>('users');
    if (latest && latest.length > 0) {
      cachedUsers = latest;
    }
    return [...cachedUsers];
  },

  async fetchUsers(): Promise<User[]> {
    const users = await loadJsonData<User[]>('users');
    if (users && users.length > 0) {
      cachedUsers = users;
    }
    return [...cachedUsers];
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return this.getUsers().find((u) => u.email.trim().toLowerCase() === normalized);
  },

  async register(data: SignupData): Promise<{ user: User; token: string }> {
    await new Promise((res) => setTimeout(res, 300));
    // Fetch latest users from file
    await this.fetchUsers();

    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = this.getUserByEmail(normalizedEmail);
    if (existing) {
      throw new Error(`An account with email "${data.email}" already exists. Please log in.`);
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password || 'password123',
      role: data.role,
      phone: data.phone?.trim() || '+1 (555) 000-0000',
      company:
        data.company?.trim() ||
        (data.role === 'LANDLORD' ? 'Independent Property Manager' : undefined),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        data.name.trim()
      )}&backgroundColor=059669,0d9488,0284c7`,
      createdAt: new Date().toISOString(),
    };

    cachedUsers = [newUser, ...this.getUsers()];
    // Save directly to src/data/users.json on disk!
    await saveJsonData('users', cachedUsers);

    const token = `jwt_token_${newUser.id}_${Date.now()}`;
    return { user: newUser, token };
  },

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    await new Promise((res) => setTimeout(res, 300));
    // Refresh latest users from file
    await this.fetchUsers();

    const normalizedEmail = credentials.email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find((u) => u.email.trim().toLowerCase() === normalizedEmail);

    if (!user) {
      throw new Error(
        `No account found matching "${credentials.email}". Please check your email or create a new account.`
      );
    }

    // Role check if provided
    if (credentials.role && user.role !== credentials.role) {
      throw new Error(
        `This account is registered as a ${user.role}. Please select the ${user.role} role tab to sign in.`
      );
    }

    // Password validation
    if (credentials.password && user.password && user.password !== credentials.password) {
      throw new Error('Incorrect password. Please verify your password and try again.');
    }

    const token = `jwt_token_${user.id}_${Date.now()}`;
    return { user, token };
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error(`User ${id} not found`);

    users[index] = {
      ...users[index],
      ...updates,
    };
    cachedUsers = users;
    // Persist directly to src/data/users.json on disk!
    await saveJsonData('users', users);
    return users[index];
  },

  getDemoAccounts(): User[] {
    return this.getUsers();
  },
};

export default authService;
