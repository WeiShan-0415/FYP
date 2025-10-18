// api/agent.js
import express from 'express'
import { createAgent } from '@veramo/core'
import { DIDManager,MemoryDIDStore } from '@veramo/did-manager'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getDidKeyResolver, KeyDIDProvider } from '@veramo/did-provider-key'
import { getResolver as getEthrResolver } from 'ethr-did-resolver'
import { getResolver as getWebResolver } from 'web-did-resolver'

const agent = createAgent({
  plugins: [
    new KeyManager({
      store: new MemoryKeyStore(),
      kms: {
        local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
      },
    }),
    new DIDManager({
      store: new MemoryDIDStore(),
      defaultProvider: 'did:key',
      providers: {
        'did:key': new KeyDIDProvider({
            defaultKms: 'local',
            }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...getDidKeyResolver(),
        ...getEthrResolver({ infuraProjectId: 'INFURA_PROJECT_ID' }),
        ...getWebResolver(),
      }),
    }),
  ],
})

const app = express()

app.get('/api/agent/ping', (req, res) => {
  res.json({ message: '✅ Veramo Agent is alive!' })
})

app.get('/api/agent/create-did', async (req, res) => {
  try {
    const identifier = await agent.didManagerCreate()
    res.json(identifier)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Veramo agent running at http://localhost:${PORT}`)
})

export default app
