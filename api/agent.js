// api/agent.js
import { createAgent, IDIDManager, IKeyManager, IDataStore, IResolver } from '@veramo/core'
import { DIDManager } from '@veramo/did-manager'
import { KeyManager } from '@veramo/key-manager'
import { KeyManagementSystem, MemoryPrivateKeyStore } from '@veramo/kms-local'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { getDidKeyResolver } from '@veramo/did-provider-key'
import { agentRouter } from '@veramo/remote-server'
import express from 'express'

const agent = createAgent({
  plugins: [
    new KeyManager({
      store: new MemoryPrivateKeyStore(),
      kms: { local: new KeyManagementSystem() },
    }),
    new DIDManager({
      providers: {},
      defaultProvider: 'did:key',
    }),
    new DIDResolverPlugin({
      resolver: getDidKeyResolver(),
    }),
  ],
})

const app = express()
app.use(express.json())
app.use('/api/agent', agentRouter(agent))

export default app
