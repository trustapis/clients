import { AccessRequest, PolicyEngine, AccessResult, Effect } from 'trustless'

const missingInput = toJSON({
  success: false,
  errors: [{ code: 400, message: 'missing input' }]
})

export async function onRequest(
  request: Request,
  engine: PolicyEngine
): Promise<Response> {
  if (request.method === 'GET') {
    return new Response(missingInput)
  }

  let body = await request.json()
  let batch: AccessRequest[] = []

  if (typeof body['batch'] !== 'undefined') {
    batch = body['batch'] as AccessRequest[]
  } else {
    batch = [body as AccessRequest]
  }

  let results: AccessResult[] = engine.ProcessBatch(batch)
  let headers: HeadersInit = {
    'content-type': 'application/json'
  }

  if (results.length === 1) {
    let status = getStatusForEffect(results[0].Effect)

    return new Response(toJSON(results[0]), { status, headers })
  }

  return new Response(toJSON({ results }), { headers })
}

function toJSON(o: any) {
  return JSON.stringify(o, null, 2)
}

function getStatusForEffect(effect: Effect) {
  switch (effect) {
    case 'allow':
      return 200
    case 'block':
      return 401
    default:
      return 500
  }
}
