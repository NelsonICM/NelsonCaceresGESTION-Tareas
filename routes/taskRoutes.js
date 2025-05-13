const express = require('express');
const router = express.Router();
const {
  getProjectTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addComment
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/tasks/project/{projectId}:
 *   get:
 *     summary: Obtener todas las tareas de un proyecto
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID del proyecto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tareas obtenida exitosamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.get('/project/:projectId', protect, getProjectTasks);

/**
 * @swagger
 * /api/tasks/my-tasks:
 *   get:
 *     summary: Obtener tareas asignadas al usuario
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tareas obtenida exitosamente
 */
router.get('/my-tasks', protect, getMyTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obtener tarea por ID
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarea obtenida exitosamente
 *       404:
 *         description: Tarea no encontrada
 */
router.get('/:id', protect, getTaskById);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Crear una nueva tarea
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - project
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título de la tarea
 *               description:
 *                 type: string
 *                 description: Descripción de la tarea
 *               project:
 *                 type: string
 *                 description: ID del proyecto al que pertenece
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Prioridad de la tarea (baja, media, alta)
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de vencimiento
 *               assignedTo:
 *                 type: string
 *                 description: ID del usuario asignado
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', protect, createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Actualizar tarea
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título de la tarea
 *               description:
 *                 type: string
 *                 description: Descripción de la tarea
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *                 description: Estado de la tarea (pendiente, en progreso, completada)
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Prioridad de la tarea (baja, media, alta)
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de vencimiento
 *               assignedTo:
 *                 type: string
 *                 description: ID del usuario asignado
 *     responses:
 *       200:
 *         description: Tarea actualizada exitosamente
 *       404:
 *         description: Tarea no encontrada
 */
router.put('/:id', protect, updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Eliminar tarea
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarea eliminada exitosamente
 *       404:
 *         description: Tarea no encontrada
 */
router.delete('/:id', protect, deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/comments:
 *   post:
 *     summary: Agregar comentario a una tarea
 *     tags: [Tareas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Texto del comentario
 *     responses:
 *       200:
 *         description: Comentario agregado exitosamente
 *       404:
 *         description: Tarea no encontrada
 */
router.post('/:id/comments', protect, addComment);

module.exports = router; 