import { onRequest } from '../handler'
import { PolicyEngine, AccessPolicy, createPolicyEngine } from 'trustless'

function onFetchEvent(event: Event, engine: PolicyEngine) {
  let e = event as FetchEvent

  e.respondWith(onRequest(e.request, engine))
}

export type TrustlessCFWorkerInput = {
  Policies: AccessPolicy[]
}

export function startCloudflareWorker(input: TrustlessCFWorkerInput) {
  let { Policies } = input
  let engine = createPolicyEngine({ Policies })

  addEventListener('fetch', (event: Event) => onFetchEvent(event, engine))
}
