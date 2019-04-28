import test from 'ava'
import * as fs from 'fs'
import { promisify } from 'util'
import { createPolicyEngine } from '../src'

let writeFile = promisify(fs.writeFile).bind(fs)

test('single, simple audit entry <array>', t => {
  let engine = createPolicyEngine({
    Policies: [
      {
        Rules: [
          {
            Effect: 'block',
            Actions: ['*'],
            Resources: ['*'],
            ErrorTemplate: 'missing reason',
            Conditions: [{ Reason: '' }]
          }
        ]
      }
    ]
  })

  engine.Process({
    Actor: { ID: 'testusr' },
    Actions: ['simple::Test'],
    Resources: ['simple:object::123']
  })

  let entries = engine.getAuditLogArray()

  t.is(entries.length, 1)
})

test('10 requests', async t => {
  let engine = createPolicyEngine({
    Policies: [
      {
        Rules: [
          {
            Effect: 'block',
            Actions: ['*'],
            Resources: ['*'],
            ErrorTemplate: 'missing reason',
            Conditions: [{ Reason: '' }]
          }
        ]
      }
    ]
  })

  let req = {
    Actor: { ID: 'testusr' },
    Actions: ['simple::Test'],
    Resources: ['simple:object::123']
  }

  for (let i = 0; i < 10; i++) {
    let Reason = Math.random() > 0.5 ? 'valid reason' : ''
    engine.Process({ ...req, Reason })
  }

  let entries = engine.getAuditLogArray()
  let j = (o: any) => JSON.stringify(o, null, 2)

  await writeFile('./tmp/audit_log_123.json', j(entries))

  t.is(entries.length, 10)
})
