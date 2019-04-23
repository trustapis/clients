export type AccessRequest = {
  Actor: Actor
  Actions: Actions
  Resources: Resources

  // Metadata
  AppDomain?: AppDomain
  Reason?: Reason
}

export type AccessPolicy = {
  Rules: Rule[]
}

export type AccessResult = {
  Effect: Effect
  Errors?: AccessPolicyErrors
}

export type AccessPolicyBatchResult = {
  Results: AccessResult[]
}

export type AccessPolicyErrors = AccessPolicyError[]
export type AccessPolicyError = {
  Code: string
  Message: string
}

export type Rule = {
  Effect: Effect
  Actions: Actions
  Resources: Resources
  ErrorTemplate?: ErrorTemplate
  Conditions: RuleCondition[]
}

export type Actor = {
  ID: string
  Groups?: string[]
}

export type Effect = string
export type Actions = string[]
export type Resources = string[]
export type ErrorTemplate = string

export type RuleCondition = {
  Actor?: Actor
  Reason?: Reason
  AppDomain?: AppDomain
  ExternalEval?: ExternalEval
}

export type Reason = string
export type AppDomain = string
export type ExternalEval = {
  URL: string
}

export type AccessPolicyInput = AccessPolicy

export function createPolicy(input: AccessPolicyInput) {
  return input
}
