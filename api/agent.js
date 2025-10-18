// api/agent.js
import 'reflect-metadata'
import { createAgent } from '@veramo/core'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getDidKeyResolver, KeyDIDProvider } from '@veramo/did-provider-key'
import { getResolver as getEthrResolver } from 'ethr-did-resolver'
import { getResolver as getWebResolver } from 'web-did-resolver'

// Cache agent between invocations to reduce cold-starts
let cachedAgent = null

async function getAgent() {
  if (cachedAgent) return cachedAgent

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
          'did:key': new KeyDIDProvider({ defaultKms: 'local' }),
        },
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...getDidKeyResolver(),
          ...getEthrResolver({ infuraProjectId: process.env.INFURA_PROJECT_ID || '' }),
          ...getWebResolver(),
        }),
      }),
    ],
  })

  cachedAgent = agent
  return agent
}

export default async function handler(req, res) {
  const { method, url } = req
  // simple router for /api/agent/ping and /api/agent/create-did
  try {
    if (url.endsWith('/ping') && method === 'GET') {
      return res.status(200).json({ message: '✅ Veramo Agent is alive!' })
    }

    if (url.endsWith('/create-did') && method === 'GET') {
      const agent = await getAgent()
      const identifier = await agent.didManagerCreate({ provider: 'did:key' })
      return res.status(200).json(identifier)
    }

    res.status(404).json({ error: 'not found' })
  } catch (err) {
    console.error('Agent error:', err)
    res.status(500).json({ error: err.message || String(err) })
  }
}
