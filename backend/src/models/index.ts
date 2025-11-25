import { Sequelize } from 'sequelize';
import { initUserModel, User } from './User';
import { initUserProfileModel, UserProfile } from './UserProfile';
import { initUserLoginLogModel, UserLoginLog } from './UserLoginLog';
import { initVerificationCodeModel, VerificationCode } from './VerificationCode';
import {
  DiyPage,
  DiyComponent,
  DiyTemplate,
  DiyPagePublication,
  DiyOperationLog,
  DiyMediaResource,
  setupDiyAssociations
} from './diy.models';

export function initModels(sequelize: Sequelize) {
  // Initialize all models
  initUserModel(sequelize);
  initUserProfileModel(sequelize);
  initUserLoginLogModel(sequelize);
  initVerificationCodeModel(sequelize);

  // Initialize DIY models
  DiyPage.initModel(sequelize);
  DiyComponent.initModel(sequelize);
  DiyTemplate.initModel(sequelize);
  DiyPagePublication.initModel(sequelize);
  DiyOperationLog.initModel(sequelize);
  DiyMediaResource.initModel(sequelize);

  // Define associations
  User.hasOne(UserProfile, {
    foreignKey: 'user_id',
    as: 'profile',
  });

  UserProfile.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  User.hasMany(UserLoginLog, {
    foreignKey: 'user_id',
    as: 'login_logs',
  });

  UserLoginLog.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  // Setup DIY model associations
  setupDiyAssociations(sequelize);

  return {
    User,
    UserProfile,
    UserLoginLog,
    VerificationCode,
    DiyPage,
    DiyComponent,
    DiyTemplate,
    DiyPagePublication,
    DiyOperationLog,
    DiyMediaResource,
  };
}

export { User, UserProfile, UserLoginLog, VerificationCode };
export {
  DiyPage,
  DiyComponent,
  DiyTemplate,
  DiyPagePublication,
  DiyOperationLog,
  DiyMediaResource
};

