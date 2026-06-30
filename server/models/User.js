import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readUsers, writeUsers, readJobs, mockHashPassword, mockComparePassword } from '../config/mockStore.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    googleId: String,
    avatar: String,
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    profile: {
      skills: [String],
      experience: String,
      location: String,
      resume: String,
      bio: String,
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    lastLogin: Date,
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const RealUserModel = mongoose.model('User', userSchema);

class MockUserInstance {
  constructor(data) {
    Object.assign(this, data);
    // Mongoose provides a virtual `id` that aliases `_id`
    if (!this.id) this.id = this._id;
    this.bookmarks = data.bookmarks || [];
    this.bookmarks.pull = (id) => {
      const idx = this.bookmarks.findIndex((x) => x.toString() === id.toString());
      if (idx !== -1) this.bookmarks.splice(idx, 1);
    };
    if (!this.profile) {
      this.profile = { skills: [], experience: '', location: '', resume: '', bio: '' };
    }
  }

  async save() {
    const users = readUsers();
    const plainData = {
      _id: this._id,
      name: this.name,
      email: this.email,
      password: this.password,
      googleId: this.googleId || null,
      avatar: this.avatar || null,
      bookmarks: Array.isArray(this.bookmarks) ? this.bookmarks.filter(b => typeof b === 'string') : [],
      profile: this.profile || { skills: [], experience: '', location: '', resume: '', bio: '' },
      role: this.role || 'user',
      isVerified: this.isVerified || false,
      lastLogin: this.lastLogin || null,
      createdAt: this.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const idx = users.findIndex((u) => u._id === this._id);
    if (idx !== -1) {
      users[idx] = plainData;
    } else {
      users.push(plainData);
    }
    writeUsers(users);
    return this;
  }

  async comparePassword(candidatePassword) {
    return mockComparePassword(candidatePassword, this.password);
  }
}

const MockUserModel = {
  find: async (query = {}) => {
    const users = readUsers();
    return users.map((u) => new MockUserInstance(u));
  },
  findOne: (query = {}) => {
    const result = {
      _query: query,
      select() { return this; },
      then(resolve, reject) {
        try {
          const users = readUsers();
          let user;
          if (this._query.email) {
            user = users.find((u) => u.email === this._query.email.toLowerCase());
          } else if (this._query.googleId) {
            user = users.find((u) => u.googleId === this._query.googleId);
          }
          resolve(user ? new MockUserInstance(user) : null);
        } catch (e) {
          reject(e);
        }
      },
    };
    return result;
  },
  findById: (id) => {
    const query = {
      _id: id,
      _shouldPopulate: false,
      select() { return this; },
      populate() { this._shouldPopulate = true; return this; },
      then(resolve, reject) {
        try {
          const users = readUsers();
          const user = users.find((u) => u && u._id && u._id.toString() === id.toString());
          if (!user) return resolve(null);
          const inst = new MockUserInstance(user);
          if (this._shouldPopulate) {
            const mockJobsRef = readJobs();
            const populatedBookmarks = (inst.bookmarks || [])
              .map((bId) => mockJobsRef.find((j) => j._id === bId.toString() || j._id === bId))
              .filter(Boolean);
            inst.bookmarks = populatedBookmarks;
          }
          resolve(inst);
        } catch (e) {
          reject(e);
        }
      },
    };
    return query;
  },
  create: async (data) => {
    const users = readUsers();
    const isArray = Array.isArray(data);
    const items = isArray ? data : [data];
    const createdItems = [];

    for (const item of items) {
      const newId = item._id || 'mock-user-' + Math.random().toString(36).substr(2, 9);
      const userObj = {
        _id: newId,
        ...item,
        email: item.email.toLowerCase(),
        avatar: item.avatar || null,
        bookmarks: item.bookmarks || [],
        profile: item.profile || { skills: [], experience: '', location: '', resume: '', bio: '' },
        role: item.role || 'user',
        isVerified: item.isVerified || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (userObj.password) {
        userObj.password = await mockHashPassword(userObj.password);
      }

      users.push(userObj);
      createdItems.push(new MockUserInstance(userObj));
    }

    writeUsers(users);
    return isArray ? createdItems : createdItems[0];
  },
  findByIdAndUpdate: async (id, updates = {}) => {
    const users = readUsers();
    const idx = users.findIndex((u) => u && u._id && u._id.toString() === id.toString());
    if (idx !== -1) {
      Object.entries(updates).forEach(([k, v]) => {
        if (k === 'profile') {
          users[idx].profile = { ...users[idx].profile, ...v };
        } else {
          users[idx][k] = v;
        }
      });
      writeUsers(users);
      return new MockUserInstance(users[idx]);
    }
    return null;
  },
  deleteMany: async (query = {}) => {
    const users = readUsers();
    let remainingUsers = users;
    if (query.email && query.email.$in) {
      const emailList = query.email.$in.map(e => e.toLowerCase());
      remainingUsers = users.filter(u => u && u.email && !emailList.includes(u.email.toLowerCase()));
    }
    writeUsers(remainingUsers);
    return { deletedCount: users.length - remainingUsers.length };
  },
};

const UserDelegator = {
  findOne: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel : RealUserModel).findOne(...args),
  findById: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel : RealUserModel).findById(...args),
  create: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel : RealUserModel).create(...args),
  findByIdAndUpdate: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel : RealUserModel).findByIdAndUpdate(...args),
  find: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel : RealUserModel).find(...args),
  deleteMany: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel : RealUserModel).deleteMany(...args),
};

export default UserDelegator;
