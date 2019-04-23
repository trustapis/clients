import {
  Actor,
  Effect,
  Actions,
  Resources,
  AccessPolicyErrors,
  Reason,
  AppDomain
} from '../access/policy'

export type AuditLog = {
  Entries: AuditLogEntry[]
}

export type Metadata = {
  Reason?: Reason
  AppDomain?: AppDomain
}

export type AuditLogEntry = {
  Actor: Actor
  Effect: Effect
  Timestamp: Date
  Actions: Actions
  Resources: Resources

  // Optional
  Metadata?: Metadata
  Errors?: AccessPolicyErrors
}
