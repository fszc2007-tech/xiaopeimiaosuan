/**
 * Admin 路由总入口
 * 
 * 路径：/api/admin/v1
 */

import { Router } from 'express';
import authRoutes from './auth';
import usersRoutes from './users';
import llmRoutes from './llm';
import systemRoutes from './systemSettings';
import feedbacksRoutes from './feedbacks';
import membershipRoutes from './membership';

const router = Router();

// 挂载子路由
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/llm-config', llmRoutes);
router.use('/system', systemRoutes);
router.use('/feedbacks', feedbacksRoutes);
router.use('/membership', membershipRoutes);

export default router;

