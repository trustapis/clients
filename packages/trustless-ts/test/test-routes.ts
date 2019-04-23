import test from 'ava'
import { createPolicyEngine, AccessPolicy } from '../src'

let Policies: AccessPolicy[] = [
  {
    Rules: [
      {
        Effect: 'block',
        Actions: ['*'],
        Resources: ['*'],
        Conditions: [{ Reason: '' }],
        ErrorTemplate: 'missing reason'
      }
    ]
  },
  {
    Rules: [
      {
        Effect: 'allow',
        Actions: ['http:method::get'],
        Resources: ['internal:service::*'],
        ErrorTemplate: `You don't have permission to access user data`,
        Conditions: [
          {
            Actor: {
              ID: '*',
              Groups: ['ldap:group::can_access_user_data']
            }
          }
        ]
      },
      {
        Effect: 'allow',
        Actions: ['http:method::*'],
        Resources: ['internal:service::*'],
        ErrorTemplate: `You don't have permission to modify user data`,
        Conditions: [
          {
            Actor: {
              ID: '*',
              Groups: ['ldap:group::can_modify_user_data']
            }
          }
        ]
      }
    ]
  }
]

test('[block - no group] GET to internal service', t => {
  let engine = createPolicyEngine({ Policies })

  let result = engine.Eval({
    Actor: { ID: 'testusr' },
    Actions: ['http:method::get'],
    Resources: ['internal:service::user-profile-viewer']
  })

  t.is(result.Effect, 'block')
})

test('[block - wrong group] GET to internal service', t => {
  let engine = createPolicyEngine({ Policies })

  let result = engine.Eval({
    Actor: { ID: 'testusr', Groups: ['random-group'] },
    Actions: ['http:method::get'],
    Resources: ['internal:service::user-profile-viewer']
  })

  t.is(result.Effect, 'block')
})

test('[allow] GET to internal service', t => {
  let engine = createPolicyEngine({ Policies })

  let result = engine.Eval({
    Reason: 'valid reason',
    Actions: ['http:method::get'],
    Actor: { ID: 'testusr', Groups: ['ldap:group::can_access_user_data'] },
    Resources: ['internal:service::user-profile-viewer/api/users*']
  })

  t.is(result.Effect, 'allow')
})

test('[block - wrong group] POST to internal service', t => {
  let engine = createPolicyEngine({ Policies })

  let result = engine.Eval({
    Actor: { ID: 'testusr', Groups: ['ldap:group::can_access_user_data'] },
    Actions: ['http:method::post'],
    Resources: ['internal:service::user-profile-viewer/api/users*']
  })

  t.is(result.Effect, 'block')
  t.is(result.Errors.length, 1)
})

test('[allow] POST to internal service', t => {
  let engine = createPolicyEngine({ Policies })

  let result = engine.Eval({
    Reason: 'valid reason',
    Actions: ['http:method::post'],
    Actor: { ID: 'testusr', Groups: ['ldap:group::can_modify_user_data'] },
    Resources: [
      'internal:service::user-profile-viewer/api/users*',
      'internal:service::user-profile-viewer/api/permissions*'
    ]
  })

  t.is(result.Effect, 'allow')
})
