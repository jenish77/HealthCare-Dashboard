import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userRole: string;
  action:
    | 'CREATE_ENCOUNTER'
    | 'UPDATE_ENCOUNTER'
    | 'DELETE_ENCOUNTER'
    | 'CREATE_PATIENT'
    | 'UPDATE_PATIENT'
    | 'CREATE_USER'
    | 'UPDATE_USER'
    | 'DEACTIVATE_USER'
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    | 'ACCESS_DENIED';
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: [
        'CREATE_ENCOUNTER',
        'UPDATE_ENCOUNTER',
        'DELETE_ENCOUNTER',
        'CREATE_PATIENT',
        'UPDATE_PATIENT',
        'CREATE_USER',
        'UPDATE_USER',
        'DEACTIVATE_USER',
        'USER_LOGIN',
        'USER_LOGOUT',
        'ACCESS_DENIED',
      ],
      required: true,
      index: true,
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLog;
