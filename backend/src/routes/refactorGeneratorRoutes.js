import express from 'express';
import { generateRefactoringSnippet } from '../controllers/refactorGeneratorController.js';

const router = express.Router();

router.post('/suggest', generateRefactoringSnippet);

export default router;
