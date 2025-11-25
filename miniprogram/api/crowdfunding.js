// 房车众筹相关API

const BASE_URL = 'https://api.daodaorv.com/api/v1'

// 获取众筹项目列表
export const getCrowdfundingProjects = (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        message: 'success',
        data: {
          list: [
            {
              id: 1,
              title: '豪华房车众筹项目',
              image: 'https://via.placeholder.com/120x120/FF9F29/FFFFFF?text=房车',
              progress: 80,
              targetAmount: 1000000, // 100万
              raisedAmount: 800000,   // 80万
              returnRate: '8-12',
              daysLeft: 15,
              riskLevel: '高',
              status: 'active'
            },
            {
              id: 2,
              title: '经济房车众筹项目',
              image: 'https://via.placeholder.com/120x120/8860D0/FFFFFF?text=房车',
              progress: 70,
              targetAmount: 500000,  // 50万
              raisedAmount: 350000,   // 35万
              returnRate: '6-8',
              daysLeft: 20,
              riskLevel: '中',
              status: 'active'
            },
            {
              id: 3,
              title: '亲子房车众筹项目',
              image: 'https://via.placeholder.com/120x120/67C23A/FFFFFF?text=房车',
              progress: 45,
              targetAmount: 800000,  // 80万
              raisedAmount: 360000,   // 36万
              returnRate: '7-10',
              daysLeft: 30,
              riskLevel: '低',
              status: 'active'
            }
          ],
          hasMore: true,
          total: 15
        }
      })
    }, 500)
  })
}

// 获取众筹项目详情
export const getCrowdfundingProjectDetail = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        message: 'success',
        data: {
          id: id,
          title: '豪华房车众筹项目',
          description: '本项目旨在为房车爱好者提供高品质的豪华房车投资机会，预计年化收益率8-12%。',
          images: [
            'https://via.placeholder.com/400x300/FF9F29/FFFFFF?text=房车1',
            'https://via.placeholder.com/400x300/8860D0/FFFFFF?text=房车2'
          ],
          progress: 80,
          targetAmount: 1000000,
          raisedAmount: 800000,
          returnRate: '8-12',
          daysLeft: 15,
          riskLevel: '高',
          status: 'active',
          minInvestment: 10000,  // 最低投资金额
          maxInvestment: 1000000, // 最高投资金额
          investors: 156,
          startTime: '2025-11-01',
          endTime: '2025-12-20',
          expectedReturnTime: '2026-01-05',
          projectDetails: {
            vehicleModel: '豪华A型房车',
            year: '2025款',
            seats: 6,
            features: ['自动档', '导航系统', '太阳能板', '发电机', '空调系统'],
            locations: ['北京', '上海', '广州', '深圳', '杭州']
          },
          riskDisclosure: '投资有风险，本项目为高风险投资项目，投资者应充分了解风险并理性投资。'
        }
      })
    }, 300)
  })
}

// 提交众筹投资订单
export const submitCrowdfundingOrder = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟验证
      if (data.amount < 10000) {
        reject({
          code: 100001,
          message: '投资金额不能少于1万元'
        })
        return
      }

      resolve({
        code: 0,
        message: 'success',
        data: {
          orderId: 'CF' + Date.now(),
          projectId: data.projectId,
          amount: data.amount,
          shares: data.shares,
          status: 'pending',
          createTime: new Date().toISOString()
        }
      })
    }, 800)
  })
}

// 获取交易市场数据
export const getMarketData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        message: 'success',
        data: {
          currentPrice: '125.80',
          changePercent: 2.3,
          changeAmount: 2.82,
          volume: '1,250',
          turnover: '157,250',
          highestPrice: '128.50',
          lowestPrice: '123.20',
          openingPrice: '123.00',
          previousClose: '122.98',
          tradingHours: '09:30-15:00',
          marketStatus: 'open', // open, close, pre_market, after_hours
          userInfo: {
            holdings: 50,
            orders: 2,
            todayProfit: '+128.50',
            totalProfit: '+1,258.30'
          }
        }
      })
    }, 300)
  })
}

// 提交交易订单
export const submitTradeOrder = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟验证
      if (data.quantity < 1) {
        reject({
          code: 100001,
          message: '交易数量不能少于1份'
        })
        return
      }

      if (data.price < 100 || data.price > 200) {
        reject({
          code: 100002,
          message: '价格超出合理范围'
        })
        return
      }

      resolve({
        code: 0,
        message: 'success',
        data: {
          orderId: 'T' + Date.now(),
          type: data.type, // buy, sell
          price: data.price,
          quantity: data.quantity,
          totalAmount: data.price * data.quantity,
          fee: Math.max(data.price * data.quantity * 0.005, 1),
          status: 'pending',
          createTime: new Date().toISOString()
        }
      })
    }, 600)
  })
}

// 获取用户持仓
export const getUserHoldings = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        message: 'success',
        data: {
          holdings: [
            {
              projectId: 1,
              projectName: '豪华房车众筹项目',
              shares: 30,
              avgPrice: 118.50,
              currentPrice: 125.80,
              marketValue: 3774.00,
              profit: 219.00,
              profitRate: 6.16,
              buyTime: '2025-11-01'
            },
            {
              projectId: 2,
              projectName: '经济房车众筹项目',
              shares: 20,
              avgPrice: 95.20,
              currentPrice: 98.60,
              marketValue: 1972.00,
              profit: 68.00,
              profitRate: 3.57,
              buyTime: '2025-11-05'
            }
          ],
          totalShares: 50,
          totalMarketValue: 5746.00,
          totalCost: 5459.00,
          totalProfit: 287.00,
          totalProfitRate: 5.26
        }
      })
    }, 400)
  })
}

// 获取委托记录
export const getUserOrders = (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        message: 'success',
        data: {
          list: [
            {
              orderId: 'T1234567890',
              type: 'buy',
              price: 124.50,
              quantity: 10,
              executedQuantity: 8,
              status: 'partial', // pending, partial, completed, cancelled
              createTime: '2025-11-20 09:35:00',
              updateTime: '2025-11-20 10:15:00'
            },
            {
              orderId: 'T1234567891',
              type: 'sell',
              price: 126.80,
              quantity: 5,
              executedQuantity: 0,
              status: 'pending',
              createTime: '2025-11-20 10:30:00',
              updateTime: '2025-11-20 10:30:00'
            }
          ],
          hasMore: false,
          total: 2
        }
      })
    }, 300)
  })
}

// 获取历史交易记录
export const getTradeHistory = (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        message: 'success',
        data: {
          list: [
            {
              tradeId: 'H1234567890',
              type: 'buy',
              price: 123.50,
              quantity: 10,
              amount: 1235.00,
              fee: 6.18,
              tradeTime: '2025-11-19 14:25:00',
              projectName: '豪华房车众筹项目'
            },
            {
              tradeId: 'H1234567891',
              type: 'sell',
              price: 127.80,
              quantity: 5,
              amount: 639.00,
              fee: 3.20,
              tradeTime: '2025-11-18 10:15:00',
              projectName: '经济房车众筹项目'
            }
          ],
          hasMore: true,
          total: 25
        }
      })
    }, 400)
  })
}

// 获取众筹收益记录
export const getCrowdfundingEarnings = (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        message: 'success',
        data: {
          totalEarnings: 1580.50,
          monthlyEarnings: 89.20,
          lastMonthEarnings: 75.30,
          yearEarnings: 980.40,
          records: [
            {
              id: 1,
              projectId: 1,
              projectName: '豪华房车众筹项目',
              earnings: 45.60,
              rate: 0.08,
              period: '2025-10',
              settleTime: '2025-11-05 00:00:00',
              status: 'settled'
            },
            {
              id: 2,
              projectId: 2,
              projectName: '经济房车众筹项目',
              earnings: 43.60,
              rate: 0.07,
              period: '2025-10',
              settleTime: '2025-11-05 00:00:00',
              status: 'settled'
            }
          ]
        }
      })
    }, 500)
  })
}

// 取消委托订单
export const cancelTradeOrder = (orderId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        code: 0,
        message: 'success',
        data: {
          orderId: orderId,
          status: 'cancelled',
          cancelTime: new Date().toISOString()
        }
      })
    }, 300)
  })
}

// 获取项目风险等级说明
export const getRiskLevelInfo = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        message: 'success',
        data: {
          levels: [
            {
              level: '低',
              description: '风险较低，预期收益相对稳定，适合保守型投资者',
              returnRange: '5-8%',
              features: ['项目成熟稳定', '现金流可预测', '风险控制措施完善']
            },
            {
              level: '中',
              description: '风险适中，预期收益较为可观，适合平衡型投资者',
              returnRange: '7-12%',
              features: ['项目发展良好', '市场前景明确', '有一定波动性']
            },
            {
              level: '高',
              description: '风险较高，预期收益可观，适合进取型投资者',
              returnRange: '10-18%',
              features: ['创新项目类型', '市场不确定性高', '需要承受较大波动']
            }
          ]
        }
      })
    }, 200)
  })
}