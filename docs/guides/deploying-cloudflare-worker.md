## Deploying a Policy Engine on Cloudflare Workers

#### Prerequisites

- Cloudflare Account
- [Cloudflare Auth Key](https://support.cloudflare.com/hc/en-us/articles/200167836-Where-do-I-find-my-Cloudflare-API-key-) and [Zone ID](https://developers.cloudflare.com/workers/api/#zone-id)
- [`deploy-worker`](https://github.com/fouad/deploy-worker) node module for deploying Cloudflare Worker

> Recommendation: Install `deploy-worker` globally by running `npm install --global deploy-worker` or `yarn global add deploy-worker` instead of inside each project.

#### Authentication

You need to pass in `CF_EMAIL` and `CF_AUTH_Key` as environment variables and then you can set `CF_ZONE_ID`/`--zone-id` and optionally `CF_ACCOUNT_ID`/`--acount-id` if you're an Enterprise customer.

#### Usage

Create a `package.json` to install the `trustless-worker` helper node module which includes the base `trustless` API client:

```js
{
  "dependencies": {
    "trustless-worker": "latest"
  }
}
```

Then create your `worker.js` to bootstrap the Cloudflare Worker:

```js
import { startCloudflareWorker } from 'trustless-worker'
import jsonPolicies from './test-policies.json'

let Policies = [...jsonPolicies]

startCloudflareWorker({ Policies })
```

You can either define policies directly in the code or in a separate file like `test-policies.json`:

```js
;[
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
        ErrorTemplate: "You don't have permission to access user data",
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
        ErrorTemplate: "You don't have permission to modify user data",
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
```

Make sure your dependencies are installed:

```console
npm install
```

Then run `deploy-worker` like this:

```console
deploy-worker --zone-id {zone-id} worker.js
```

Congrats! You deployed your Cloudflare Worker 🎉
