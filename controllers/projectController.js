const Project = require('../models/Project');
const mongoose = require('mongoose');


const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    }).populate('owner', 'username email')
      .populate('members', 'username email');

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};


const getProjectById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Request user ID:', req.user._id);
    console.log('Project ID requested:', id);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const project = await Project.findById(id);
    console.log('Project found:', project ? 'Yes' : 'No');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    console.log('Project owner:', project.owner.toString());
    console.log('Project members:', project.members.map(m => m.toString()));
    
    // Check if user has access to project
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.map(member => member.toString()).includes(req.user._id.toString());
    
    console.log('Is owner:', isOwner);
    console.log('Is member:', isMember);

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    const populatedProject = await project.populate([
      { path: 'owner', select: 'username email' },
      { path: 'members', select: 'username email' }
    ]);

    res.json({
      success: true,
      data: populatedProject
    });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
};


const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, members } = req.body;

    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      owner: req.user._id,
      members: members || []
    });

    const populatedProject = await project.populate([
      { path: 'owner', select: 'username email' },
      { path: 'members', select: 'username email' }
    ]);

    res.status(201).json({
      success: true,
      data: populatedProject
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};


const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check ownership
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    const { name, description, status, startDate, endDate, members } = req.body;

    project.name = name || project.name;
    project.description = description || project.description;
    project.status = status || project.status;
    project.startDate = startDate || project.startDate;
    project.endDate = endDate || project.endDate;
    project.members = members || project.members;

    await project.save();

    const updatedProject = await project.populate([
      { path: 'owner', select: 'username email' },
      { path: 'members', select: 'username email' }
    ]);

    res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};


const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project removed'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
};


const addProjectMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this project'
      });
    }

    const { userId } = req.body;

    // Check if member already exists
    if (project.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    project.members.push(userId);
    await project.save();

    const updatedProject = await project.populate([
      { path: 'owner', select: 'username email' },
      { path: 'members', select: 'username email' }
    ]);

    res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error adding member to project',
      error: error.message
    });
  }
};

const removeProjectMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check ownership
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this project'
      });
    }

    const { userId } = req.params;

    project.members = project.members.filter(
      member => member.toString() !== userId
    );

    await project.save();

    const updatedProject = await project.populate([
      { path: 'owner', select: 'username email' },
      { path: 'members', select: 'username email' }
    ]);

    res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error removing member from project',
      error: error.message
    });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember
}; 