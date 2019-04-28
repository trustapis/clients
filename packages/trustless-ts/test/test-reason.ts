import test from 'ava'
import { createPolicyEngine } from '../src'

test('[block] missing reason', t => {
  let engine = createPolicyEngine({
    Policies: [
      {
        Rules: [
          {
            Effect: 'block',
            Actions: ['*'],
            Resources: ['*'],
            Conditions: [{ Reason: '' }]
          }
        ]
      }
    ]
  })

  let result = engine.Process({
    Actor: { ID: 'testusr' },
    Actions: ['simple::Test'],
    Resources: ['simple:object::123']
  })

  t.is(result.Effect, 'block')
})

test('[allow] has reason', t => {
  let engine = createPolicyEngine({
    Policies: [
      {
        Rules: [
          {
            Effect: 'block',
            Actions: ['*'],
            Resources: ['*'],
            Conditions: [{ Reason: '' }]
          }
        ]
      }
    ]
  })

  let result = engine.Process({
    Actor: { ID: 'testusr' },
    Actions: ['simple::Test'],
    Resources: ['simple:object::123'],
    Reason: 'Marketing follow-up'
  })

  t.is(result.Effect, 'allow')
})
