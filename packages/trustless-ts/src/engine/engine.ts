import {
  AccessPolicy,
  AccessRequest,
  AccessResult,
  AccessPolicyErrors,
  AccessPolicyError,
  Resources,
  Actions
} from '../access'
import { AuditLog, AuditLogEntry } from '../audit'

export type Engine = {
  Policies: AccessPolicy[]
}

export type EngineInput = Engine

function matchResources(o: Resources, n: Resources): boolean {
  if (o[0] === '*') {
    return true
  }

  return (
    n.filter(r => {
      return o.filter(or => or === r).length > 0
    }).length > 0
  )
}

function matchActions(o: Actions, n: Actions): boolean {
  if (o[0] === '*') {
    return true
  }

  return (
    n.filter(a => {
      return o.filter(oa => oa === a).length > 0
    }).length > 0
  )
}

function renderErrorTemplate(tpl: string): string {
  return tpl
}

export class PolicyEngine {
  Policies: AccessPolicy[]
  __audit_log: AuditLog

  constructor(props: EngineInput) {
    this.Policies = props.Policies
    this.__audit_log = { Entries: [] }
  }

  Eval = (request: AccessRequest): AccessResult => {
    let errors: AccessPolicyErrors = this.Policies.map(policy => {
      return policy.Rules.map(rule => {
        let err: AccessPolicyError
        let getError = (): AccessPolicyError => {
          let msg = renderErrorTemplate(rule.ErrorTemplate)

          return {
            Message: msg,
            Code: 'unauthorized'
          }
        }

        if (matchResources(rule.Resources, request.Resources)) {
          if (matchActions(rule.Actions, request.Actions)) {
            let conditionErrors: AccessPolicyErrors = rule.Conditions.map(
              (cnd): AccessPolicyError => {
                if (typeof cnd.Reason === 'string') {
                  if (
                    rule.Effect === 'block' &&
                    (cnd.Reason === request.Reason || !request.Reason)
                  ) {
                    return getError()
                  }
                }
              }
            ).filter(Boolean)

            return conditionErrors[0]
          }
        } else {
          err = getError()
        }

        return err
      }).filter(Boolean)
    }).reduce((a, b) => a.concat(b), [])

    let result: AccessResult = {
      Effect: errors.length > 0 ? 'block' : 'allow',
      Errors: errors
    }

    this.addLogEntry(request, result)

    return result
  }

  addLogEntry(request: AccessRequest, result: AccessResult) {
    let { Actor, Actions, Resources, ...Metadata } = request
    let { Effect, Errors } = result
    let entry: AuditLogEntry = {
      Actor,
      Errors,
      Effect,
      Actions,
      Metadata,
      Resources,
      Timestamp: new Date()
    }

    this.__audit_log.Entries.push(entry)
  }

  getAuditLogArray(): AuditLogEntry[] {
    return this.__audit_log.Entries
  }
}

export function createPolicyEngine(input: EngineInput): PolicyEngine {
  return new PolicyEngine(input)
}
