import Application from '../models/Application.js';

export const getApplications = async (req, res, next) => {
  try {
    const apps = await Application.find({ userId: req.user.id });
    res.json(apps);
  } catch (err) {
    next(err);
  }
};

export const createApplication = async (req, res, next) => {
  try {
    const { title, company, location, status, notes, salary, jobId } = req.body;
    if (!title || !company) {
      return res.status(400).json({ message: 'Title and Company are required' });
    }

    const app = await Application.create({
      userId: req.user.id,
      jobId: jobId || null,
      title,
      company,
      location,
      status: status || 'wishlist',
      notes,
      salary,
    });

    res.status(201).json(app);
  } catch (err) {
    next(err);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['wishlist', 'applied', 'interviewing', 'offered', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'Application card not found' });
    }

    // Verify ownership
    if (app.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Forbidden — not your card' });
    }

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const updateApplicationDetails = async (req, res, next) => {
  try {
    const { title, company, location, notes, salary } = req.body;
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'Application card not found' });
    }

    if (app.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Forbidden — not your card' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (company !== undefined) updates.company = company;
    if (location !== undefined) updates.location = location;
    if (notes !== undefined) updates.notes = notes;
    if (salary !== undefined) updates.salary = salary;

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'Application card not found' });
    }

    if (app.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Forbidden — not your card' });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application card removed successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
};
