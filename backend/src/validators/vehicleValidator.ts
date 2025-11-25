// 车辆验证器
import { body, query, param } from 'express-validator';

// 车辆列表查询参数验证
export const vehicleQuerySchema = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),

  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须是1-100之间的整数'),

  query('brandId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('品牌ID必须是大于0的整数'),

  query('categoryId')
    .optional()
    .isIn(['A型', 'B型', 'C型', '拖挂A型', '拖挂B型', '拖挂C型', '房车巴士', '越野房车', '自行式A型', '自行式B型', '自行式C型'])
    .withMessage('房车类型无效'),

  query('seats')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('座位数必须是1-10之间的整数'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('最低价格必须大于等于0'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('最高价格必须大于等于0'),

  query('fuelType')
    .optional()
    .isIn(['汽油', '柴油', '新能源', '混动', '液化气', '天然气'])
    .withMessage('燃料类型无效'),

  query('storeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('门店ID必须是大于0的整数'),

  query('sortBy')
    .optional()
    .isIn(['price_asc', 'price_desc', 'rating_desc', 'created_desc', 'popular'])
    .withMessage('排序方式无效'),

  query('pickupCity')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('取车城市长度必须在1-50字符之间'),

  query('features')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const features = value.split(',').map(f => f.trim()).filter(Boolean);
        if (features.length > 10) {
          throw new Error('车辆特性最多选择10个');
        }
      }
      return true;
    })
];

// 车辆ID验证
export const vehicleIdSchema = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('车辆ID必须是大于0的整数')
];