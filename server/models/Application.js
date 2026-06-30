import mongoose from 'mongoose';
import { readApplications, writeApplications } from '../config/mockStore.js';

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    status: {
      type: String,
      enum: ['wishlist', 'applied', 'interviewing', 'offered', 'rejected'],
      default: 'wishlist',
      index: true,
    },
    appliedDate: { type: Date, default: Date.now },
    notes: String,
    salary: String,
  },
  { timestamps: true }
);

const RealApplicationModel = mongoose.model('Application', applicationSchema);

class MockApplicationInstance {
  constructor(data) {
    Object.assign(this, data);
    if (!this.status) this.status = 'wishlist';
    if (!this.appliedDate) this.appliedDate = new Date().toISOString();
  }

  async save() {
    const apps = readApplications();
    const idx = apps.findIndex((a) => a._id === this._id);
    if (idx !== -1) {
      apps[idx] = { ...this, updatedAt: new Date().toISOString() };
    } else {
      apps.push({ ...this, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    writeApplications(apps);
    return this;
  }
}

const MockApplicationModel = {
  find: (filter = {}) => {
    let result = readApplications();
    if (filter.userId) {
      result = result.filter((a) => a.userId.toString() === filter.userId.toString());
    }
    if (filter.status) {
      result = result.filter((a) => a.status === filter.status);
    }
    return Promise.resolve(result.map((a) => new MockApplicationInstance(a)));
  },
  findById: (id) => {
    const apps = readApplications();
    const app = apps.find((a) => a._id.toString() === id.toString());
    return Promise.resolve(app ? new MockApplicationInstance(app) : null);
  },
  create: (data) => {
    const newId = 'mock-app-' + Math.random().toString(36).substr(2, 9);
    const newApp = {
      _id: newId,
      status: 'wishlist',
      appliedDate: new Date().toISOString(),
      notes: '',
      salary: '',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const apps = readApplications();
    apps.push(newApp);
    writeApplications(apps);
    return Promise.resolve(new MockApplicationInstance(newApp));
  },
  findByIdAndUpdate: (id, updates = {}) => {
    const apps = readApplications();
    const idx = apps.findIndex((a) => a._id.toString() === id.toString());
    if (idx !== -1) {
      Object.entries(updates).forEach(([k, v]) => {
        apps[idx][k] = v;
      });
      apps[idx].updatedAt = new Date().toISOString();
      writeApplications(apps);
      return Promise.resolve(new MockApplicationInstance(apps[idx]));
    }
    return Promise.resolve(null);
  },
  findByIdAndDelete: (id) => {
    const apps = readApplications();
    const idx = apps.findIndex((a) => a._id.toString() === id.toString());
    if (idx !== -1) {
      const deleted = apps.splice(idx, 1)[0];
      writeApplications(apps);
      return Promise.resolve(new MockApplicationInstance(deleted));
    }
    return Promise.resolve(null);
  },
};

const ApplicationDelegator = {
  find: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockApplicationModel : RealApplicationModel).find(...args),
  findById: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockApplicationModel : RealApplicationModel).findById(...args),
  create: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockApplicationModel : RealApplicationModel).create(...args),
  findByIdAndUpdate: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockApplicationModel : RealApplicationModel).findByIdAndUpdate(...args),
  findByIdAndDelete: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockApplicationModel : RealApplicationModel).findByIdAndDelete(...args),
};

export default ApplicationDelegator;
