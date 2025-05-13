const Task = require('../models/Task');
const Project = require('../models/Project');


const getProjectTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.owner.toString() !== req.user._id.toString() && 
        !project.members.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'username email')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};


const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name')
      .populate('assignedTo', 'username email')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};


const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'username email')
      .populate('createdBy', 'username email')
      .populate('comments.author', 'username email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const project = await Project.findById(task.project);
    if (project.owner.toString() !== req.user._id.toString() && 
        !project.members.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
};


const createTask = async (req, res) => {
  try {
    const { title, description, project, priority, dueDate, assignedTo } = req.body;

    // Verificar acceso al proyecto
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (projectDoc.owner.toString() !== req.user._id.toString() && 
        !projectDoc.members.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create tasks in this project'
      });
    }

    const task = await Task.create({
      title,
      description,
      project,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user._id
    });

    const populatedTask = await task.populate([
      { path: 'project', select: 'name' },
      { path: 'assignedTo', select: 'username email' },
      { path: 'createdBy', select: 'username email' }
    ]);

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const project = await Project.findById(task.project);
    if (project.owner.toString() !== req.user._id.toString() && 
        !project.members.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.assignedTo = assignedTo || task.assignedTo;

    await task.save();

    const updatedTask = await task.populate([
      { path: 'project', select: 'name' },
      { path: 'assignedTo', select: 'username email' },
      { path: 'createdBy', select: 'username email' }
    ]);

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};


const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const project = await Project.findById(task.project);
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task removed'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};


const addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const project = await Project.findById(task.project);
    if (project.owner.toString() !== req.user._id.toString() && 
        !project.members.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this task'
      });
    }

    const { text } = req.body;

    task.comments.push({
      text,
      author: req.user._id
    });

    await task.save();

    const updatedTask = await task.populate([
      { path: 'project', select: 'name' },
      { path: 'assignedTo', select: 'username email' },
      { path: 'createdBy', select: 'username email' },
      { path: 'comments.author', select: 'username email' }
    ]);

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

module.exports = {
  getProjectTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addComment
}; 