/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, Request, Response } from 'express';
import { UserWalletDAO } from '../../dao/wallet.dao';
import { successResponse, errorResponse } from '../../utils/response';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const walletDAO = new UserWalletDAO();

/**
 * 1. 获取钱包余额
 * GET /api/v1/wallet/balance
 */
router.get('/balance', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json(errorResponse('未授权', 401));
      return undefined;
    }
    const wallet = await walletDAO.getUserWallet(userId);

    if (!wallet) {
      return res.json(successResponse({
        balance: 0,
        frozenBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
      }));
    }

    return res.json(successResponse({
      balance: wallet.balance,
      frozenBalance: wallet.frozen_balance,
      totalIncome: wallet.total_income,
      totalExpense: wallet.total_expense,
    }));
  } catch (error: any) {
    if (error instanceof Error) {
      return res.status(500).json(errorResponse(error.message));
    }
    return res.status(500).json(errorResponse('未知错误'));
  }
});

/**
 * 2. 获取交易记录
 * GET /api/v1/wallet/transactions
 */
router.get('/transactions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json(errorResponse('未授权', 401));
      return undefined;
    }
    const page = req.query.page && !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize && !isNaN(Number(req.query.pageSize)) ? Number(req.query.pageSize) : 10;
    const type = req.query.type as string | undefined;

    const result = await walletDAO.getTransactions({
      userId,
      page,
      pageSize,
      type,
    });

    return res.json(successResponse({
      list: result.list,
      total: result.total,
      page,
      pageSize,
    }));
  } catch (error: any) {
    if (error instanceof Error) {
      return res.status(500).json(errorResponse(error.message));
    }
    return res.status(500).json(errorResponse('未知错误'));
  }
});

/**
 * 3. 钱包充值
 * POST /api/v1/wallet/recharge
 */
router.post('/recharge', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json(errorResponse('未授权', 401));
      return undefined;
    }
    const { amount, description } = req.body;

    // 验证充值金额
    if (!amount || amount <= 0) {
      return res.status(400).json(errorResponse('充值金额必须大于0', 400));
    }

    const result = await walletDAO.recharge({
      userId,
      amount: Number(amount),
      description,
    });

    return res.json(successResponse({
      wallet: result.wallet,
      transaction: result.transaction,
      message: '充值成功',
    }));
  } catch (error: any) {
    if (error instanceof Error) {
      return res.status(500).json(errorResponse(error.message));
    }
    return res.status(500).json(errorResponse('充值失败'));
  }
});

/**
 * 4. 提现申请
 * POST /api/v1/wallet/withdraw
 */
router.post('/withdraw', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json(errorResponse('未授权', 401));
      return undefined;
    }
    const { amount, accountType, accountInfo } = req.body;

    // TODO: 实现提现逻辑
    return res.json(successResponse({
      message: '提现申请已提交',
      amount,
      accountType,
      accountInfo,
      userId,
    }));
  } catch (error: any) {
    if (error instanceof Error) {
      return res.status(500).json(errorResponse(error.message));
    }
    return res.status(500).json(errorResponse('未知错误'));
  }
});

export default router;
