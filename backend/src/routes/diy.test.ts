import express from 'express';

const router = express.Router();

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    code: 0,
    message: 'DIY API is running',
    data: {
      timestamp: new Date().toISOString()
    }
  });
});

export default router;