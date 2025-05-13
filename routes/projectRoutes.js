const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Obtener todos los proyectos del usuario autenticado
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos obtenida exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/', protect, getProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Obtener proyecto por ID
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto obtenido exitosamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.get('/:id', protect, getProjectById);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del proyecto
 *               description:
 *                 type: string
 *                 description: Descripción del proyecto
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de finalización
 *               members:
 *                 type: array
 *                 description: Lista de IDs de usuarios miembros
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Proyecto creado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', protect, createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Actualizar proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del proyecto
 *               description:
 *                 type: string
 *                 description: Descripción del proyecto
 *               status:
 *                 type: string
 *                 enum: [active, completed, archived]
 *                 description: Estado del proyecto (activo, completado, archivado)
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de finalización
 *               members:
 *                 type: array
 *                 description: Lista de IDs de usuarios miembros
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Proyecto actualizado exitosamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.put('/:id', protect, updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Eliminar proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto eliminado exitosamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.delete('/:id', protect, deleteProject);

/**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     summary: Agregar miembro al proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID del usuario a agregar
 *     responses:
 *       200:
 *         description: Miembro agregado exitosamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.post('/:id/members', protect, addProjectMember);

/**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *   delete:
 *     summary: Eliminar miembro del proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID del usuario a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Miembro eliminado exitosamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.delete('/:id/members/:userId', protect, removeProjectMember);

// Ruta de depuración temporal
router.get('/debug/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Project = require('../models/Project');
    
    const id = req.params.id;
    console.log('Debugging Project ID:', id);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      projectExists: true,
      owner: project.owner.toString(),
      membersCount: project.members.length,
      members: project.members.map(m => m.toString())
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Error debugging project',
      error: error.message
    });
  }
});

module.exports = router; 