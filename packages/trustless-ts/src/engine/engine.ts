import { matchActions, matchResources } from './match'
import { AuditLog, AuditLogEntry } from '../audit'
import {
  AccessPolicy,
  AccessRequest,
  AccessResult,
  AccessPolicyErrors,
  AccessPolicyError
} from '../access'

export type Engine = {
  Policies: AccessPolicy[]
}

export type EngineInput = Engine

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

  Process(request: AccessRequest): AccessResult {
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

                if (cnd.Actor) {
                  if (cnd.Actor.Groups) {
                    // TODO: add filter(g => regexp.test(g)) check
                    if (!request.Actor.Groups) {
                      if (rule.Effect === 'allow') {
                        return getError()
                      } else {
                        // If policy states "Block if in group(s) ...", the request
                        // should allow an Actor who's not in any groups
                        return
                      }
                    }

                    let validGroups = request.Actor.Groups.filter(group => {
                      return cnd.Actor.Groups.includes(group)
                    })

                    if (validGroups.length > 0 && rule.Effect === 'block') {
                      return getError()
                    }
                  }
                }

                // Otherwise, pass by default
                return
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

  ProcessBatch(batch: AccessRequest[]): AccessResult[] {
    return batch.map(request => this.Process(request))
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
