import { cloneElement } from 'react'

let cachedAgent = null

async function getAgent() {
  if (cachedAgent) return cachedAgent

  try {
    // dynamic import ESM-only modules at runtime
    await import('reflect-metadata')
    const { createAgent } = await import('@veramo/core')
    const { DIDManager, MemoryDIDStore } = await import('@veramo/did-manager')
    const { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } = await import('@veramo/key-manager')
    const { KeyManagementSystem } = await import('@veramo/kms-local')
    const { DIDResolverPlugin } = await import('@veramo/did-resolver')
    const { Resolver } = await import('did-resolver')
    const { getDidKeyResolver, KeyDIDProvider } = await import('@veramo/did-provider-key')
    const { getResolver: getEthrResolver } = await import('ethr-did-resolver')
    const{EthrDidProvider}=await import('@veramo/did-provider-ethr')
    const { EthrDIDProvider } = await import('@veramo/did-provider-ethr')
    const { getResolver: getWebResolver } = await import('web-did-resolver')
    const {CredentialPlugin}=await import('@veramo/credential-w3c')

    // Build resolver mapping conditionally. The ethr resolver requires at least one network
    // (Infura project ID or explicit RPC network). Only include it when config is present.
    const didKeyResolver = getDidKeyResolver()
    const webResolver = getWebResolver()
    const resolvers = {}
if (process.env.INFURA_PROJECT_ID) {
    Object.assign(
      resolvers,
      getEthrResolver({
        networks: [
          {
            name: 'sepolia',
            rpcUrl: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
          },
        ],
      })
    )
    console.log('ethr-did-resolver included via INFURA_PROJECT_ID (sepolia)')
  } else if (process.env.ETH_RPC_URL) {
    Object.assign(
      resolvers,
      getEthrResolver({
        networks: [
          {
            name: 'sepolia',
            rpcUrl: process.env.ETH_RPC_URL,
          },
        ],
      })
    )
    console.log('ethr-did-resolver included via ETH_RPC_URL (sepolia)')
  } else {
    console.log('ethr-did-resolver not included (no INFURA_PROJECT_ID or ETH_RPC_URL)')
  }
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
          defaultProvider: 'did:ethr:sepolia',
          providers: 
          {
            'did:ethr:sepolia': new EthrDIDProvider(
              { 
                defaultKms: 'local',
                network: 'sepolia',
                rpcUrl: process.env.ETH_RPC_URL,
                registry: '0x03d5003bf0e79c5f5223588f347eba39afbc3818', // Sepolia DID Registry
              }),
              'did:key': new KeyDIDProvider({ defaultKms: 'local' }),
            },
        }),
        new DIDResolverPlugin({
          resolver: new Resolver(resolvers),
        }),
        new CredentialPlugin(),
      ],
    })

    cachedAgent = agent
    return agent
  } catch (err) {
    console.error('Failed to dynamically import Veramo modules:', err)
    throw err
  }
}

export default async function handler(req, res) {
  const { method, url } = req
  console.log('Incoming request:', method, url)
  const path = new URL(req.url, `http://${req.headers.host}`).pathname

  try {
    if (path === '/api/agent/check-did' && method === 'POST') {
        const { walletAddress } = req.body
        
        if (!walletAddress) {
          return res.status(400).json({ error: 'walletAddress is required' })
        }

        const did = `did:ethr:sepolia:${walletAddress}`
        
        try {
          const { ethers } = await import('ethers')
          const rpcUrl = process.env.ETH_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
          const provider = new ethers.JsonRpcProvider(rpcUrl)
          
          const DID_REGISTRY = '0x03d5003bf0e79c5f5223588f347eba39afbc3818'
          const abi = [
            'function identityOwner(address identity) public view returns (address)',
            'event DIDAttributeChanged(address indexed identity, bytes32 name, bytes value, uint validTo, uint previousChange)'
          ]
          const contract = new ethers.Contract(DID_REGISTRY, abi, provider)

          // In ethr-did, if the identityOwner is not 0x0, it's a valid DID
          const owner = await contract.identityOwner(walletAddress)
          
          if (owner !== '0x0000000000000000000000000000000000000000') {
            let createdAt = null
            let username = null
            
            // Try to get creation date and username from DIDAttributeChanged events
            try {
              const currentBlock = await provider.getBlockNumber()
              const filter = contract.filters.DIDAttributeChanged(walletAddress)
              // Query last 1 million blocks (adjust as needed for Sepolia)
              const events = await contract.queryFilter(filter, Math.max(0, currentBlock - 1000000), currentBlock)
              
              if (events.length > 0) {
                // Sort events by block number
                const sortedEvents = events.sort((a, b) => a.blockNumber - b.blockNumber)
                
                // Get the first event (earliest block) for creation date
                const firstEvent = sortedEvents[0]
                const block = await provider.getBlock(firstEvent.blockNumber)
                createdAt = new Date(block.timestamp * 1000).toISOString()
                
                // Look for username attribute in all events
                for (const event of sortedEvents) {
                  try {
                    const attributeName = ethers.decodeBytes32String(event.args.name)
                    if (attributeName === 'did/pub/username') {
                      username = ethers.toUtf8String(event.args.value)
                      console.log('Found username on blockchain:', username)
                      break
                    }
                  } catch (decodeError) {
                    // Skip events that can't be decoded
                  }
                }
              }
            } catch (eventError) {
              console.error("Failed to fetch blockchain data:", eventError)
            }
            
            return res.status(200).json({
              exists: true,
              source: 'blockchain',
              did: did,
              owner: owner,
              username: username,
              createdAt: createdAt
            })
          }
        } catch (error) {
          console.error("On-chain check failed:", error)
        }

        return res.status(200).json({ exists: false, did: did })
      }

     if (path === '/api/agent/check-did-with-username' && method === 'POST') {
        const { walletAddress, username } = req.body
        
        if (!walletAddress) {
          return res.status(400).json({ error: 'walletAddress is required' })
        }

        if (!username) {
          return res.status(400).json({ error: 'username is required' })
        }

        const did = `did:ethr:sepolia:${walletAddress}`
        
        try {
          const { ethers } = await import('ethers')
          const rpcUrl = process.env.ETH_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
          const provider = new ethers.JsonRpcProvider(rpcUrl)
          
          const DID_REGISTRY = '0x03d5003bf0e79c5f5223588f347eba39afbc3818'
          const abi = [
            'function identityOwner(address identity) public view returns (address)',
            'event DIDAttributeChanged(address indexed identity, bytes32 name, bytes value, uint validTo, uint previousChange)'
          ]
          const contract = new ethers.Contract(DID_REGISTRY, abi, provider)

          // Check if the DID exists
          const owner = await contract.identityOwner(walletAddress)
          
          if (owner === '0x0000000000000000000000000000000000000000') {
            return res.status(200).json({
              exists: false,
              usernameMatch: false,
              did: did,
              message: 'DID does not exist on blockchain'
            })
          }

          // DID exists, now check for username attribute
          let storedUsername = null
          let usernameMatch = false

          try {
            const currentBlock = await provider.getBlockNumber()
            const filter = contract.filters.DIDAttributeChanged(walletAddress)
            const events = await contract.queryFilter(filter, Math.max(0, currentBlock - 1000000), currentBlock)
            
            if (events.length > 0) {
              const sortedEvents = events.sort((a, b) => a.blockNumber - b.blockNumber)
              
              // Look for username attribute in all events
              for (const event of sortedEvents) {
                try {
                  const attributeName = ethers.decodeBytes32String(event.args.name)
                  if (attributeName === 'did/pub/username') {
                    storedUsername = ethers.toUtf8String(event.args.value)
                    console.log('Found username on blockchain:', storedUsername)
                    break
                  }
                } catch (decodeError) {
                  // Skip events that can't be decoded
                }
              }
            }
          } catch (eventError) {
            console.error("Failed to fetch blockchain data:", eventError)
          }

          // Compare username
          usernameMatch = storedUsername === username.trim()

          return res.status(200).json({
            exists: true,
            usernameMatch: usernameMatch,
            did: did,
            owner: owner,
            providedUsername: username.trim(),
            storedUsername: storedUsername,
            message: usernameMatch ? 'Username matches stored DID' : 'Username does not match stored DID'
          })

        } catch (error) {
          console.error("DID username check failed:", error)
          return res.status(500).json({ 
            error: error.message || 'Failed to check DID with username' 
          })
        }
      }

    
    if (path === '/api/agent/update-did' && method === 'POST') {
      const { walletAddress, username, txHash } = req.body;

      // Simply update your local store
      if (!global.didStore) global.didStore = {};
      
      global.didStore[walletAddress] = {
        ...global.didStore[walletAddress],
        username: username.trim(),
        onChain: true,
        lastTx: txHash,
        updatedAt: new Date().toISOString()
      };

      return res.status(200).json({ success: true });
    }
    
    if (path === '/api/agent/register-did-onchain' && method === 'POST') {
      const { walletAddress, username } = req.body
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'walletAddress is required' })
      }

      if (!process.env.PRIVATE_KEY) {
        return res.status(500).json({ 
          error: 'Server private key not configured. Please set PRIVATE_KEY environment variable with Sepolia ETH.' 
        })
      }

      try {
        // Dynamic import ethers
        const { ethers } = await import('ethers')
        
        const rpcUrl = process.env.ETH_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        if (!rpcUrl || rpcUrl.includes('undefined')) {
          return res.status(500).json({ 
            error: 'RPC URL not configured. Set ETH_RPC_URL or INFURA_PROJECT_ID.' 
          })
        }

        // Connect to Sepolia
        const provider = new ethers.JsonRpcProvider(rpcUrl)
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
        
        // DID Registry contract address and ABI
        const DID_REGISTRY = '0x03d5003bf0e79c5f5223588f347eba39afbc3818'
        const DID_REGISTRY_ABI = [
          'function setAttribute(address identity, bytes32 name, bytes value, uint validity) external',
          'function owner(address identity) external view returns (address)'
        ]
        
        const didRegistry = new ethers.Contract(DID_REGISTRY, DID_REGISTRY_ABI, wallet)
        
        // Set a DID document attribute to register the DID on-chain
        // This registers that this address controls this DID
        const name = ethers.encodeBytes32String('did/pub/Secp256k1/veriKey')
        const value = ethers.toUtf8Bytes(walletAddress) // Store wallet address as the verification key
        const validity = 86400 * 365 * 10 // 10 years validity
        
        console.log(`Registering DID for ${walletAddress} on Sepolia...`)
        const tx = await didRegistry.setAttribute(
          walletAddress,
          name,
          value,
          validity
        )
        
        console.log('Transaction sent:', tx.hash)
        const receipt = await tx.wait()
        console.log('Transaction confirmed:', receipt.transactionHash)
        
        // Also write username to blockchain if provided
        if (username && username.trim()) {
          console.log(`Writing username to blockchain...`)
          const usernameName = ethers.encodeBytes32String('did/pub/username')
          const usernameValue = ethers.toUtf8Bytes(username.trim())
          
          const usernameTx = await didRegistry.setAttribute(
            walletAddress,
            usernameName,
            usernameValue,
            validity
          )
          
          console.log('Username transaction sent:', usernameTx.hash)
          await usernameTx.wait()
          console.log('Username transaction confirmed')
        }
        
        // Get block timestamp for creation date
        const block = await provider.getBlock(receipt.blockNumber)
        const createdAt = new Date(block.timestamp * 1000).toISOString()
        
        // Store in memory
        if (!global.didStore) {
          global.didStore = {}
        }
        
        const did = `did:ethr:sepolia:${walletAddress}`
        const identifier = {
          did: did,
          provider: 'did:ethr:sepolia',
          controllerKeyId: walletAddress,
          username: username || null,
          keys: [],
          services: [],
          onChain: true,
          transactionHash: receipt.Hash,
          blockNumber: receipt.blockNumber,
          createdAt: createdAt
        }
        
        global.didStore[walletAddress] = identifier
        
        return res.status(200).json({
          success: true,
          did: did,
          transactionHash: receipt.Hash,
          blockNumber: receipt.blockNumber,
          createdAt: createdAt,
          explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.transactionHash}`
        })
        
      } catch (error) {
        console.error('Blockchain registration error:', error)
        return res.status(500).json({ 
          error: error.message || 'Failed to register DID on blockchain' 
        })
      }
    }

    if (path === '/api/agent/verify-credentials' && method === 'GET') {
      try {
        const { ethers } = await import('ethers')
        const url = new URL(req.url, `http://${req.headers.host}`)
        const credentialID = url.searchParams.get('credentialID')
        console.log('List credentials request. Credential ID filter:', credentialID)
        const rpcUrl = process.env.ETH_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        const provider = new ethers.JsonRpcProvider(rpcUrl)
        
        const DID_REGISTRY = '0x03d5003bf0e79c5f5223588f347eba39afbc3818'
        const abi = [
          'function identityOwner(address identity) public view returns (address)',
          'event DIDAttributeChanged(address indexed identity, bytes32 name, bytes value, uint validTo, uint previousChange)'
        ]
        const contract = new ethers.Contract(DID_REGISTRY, abi, provider)

        // Get all events without filtering by identity to search through all credentials
        const filter = contract.filters.DIDAttributeChanged()
        console.log('Using filter: all DIDAttributeChanged events')

        const currentBlock = await provider.getBlockNumber()
        console.log('Current block:', currentBlock, 'Querying from:', Math.max(0, currentBlock - 1000000))
        
        const events = await contract.queryFilter(filter, Math.max(0, currentBlock - 1000000), currentBlock)
        console.log('Total events found:', events.length)

        const credentials = []
        
        for (let i = 0; i < events.length; i++) {
          const event = events[i]
          console.log(`\n--- Event ${i + 1}/${events.length} ---`)
          console.log('Raw name (bytes32):', event.args.name)
          console.log('Raw value (bytes):', event.args.value)
          
          try {
            let attributeName = null
            let isCredential = false
            
            // Try to decode as bytes32 string first
            try {
              attributeName = ethers.decodeBytes32String(event.args.name)
              console.log('Decoded attribute name (string):', attributeName)
              isCredential = attributeName.startsWith('cred/')
            } catch (decodeError) {
              // If it's not a valid bytes32 string, it might be a hash
              // Check if the value looks like credential data
              console.log('Not a bytes32 string, checking if value is credential data...')
              attributeName = event.args.name // Use the hash as the name
            }
            
            // Try to parse the value as credential data
            let attributeValue
            try {
              attributeValue = ethers.toUtf8String(event.args.value)
              console.log('Decoded attribute value:', attributeValue)
            } catch (utf8Error) {
              console.log('✗ Failed to decode value as UTF-8:', utf8Error.message)
              // Skip this event if we can't decode it as UTF-8
              continue
            }
            
            // Remove quotes and unescape if needed
            let cleanValue = attributeValue
            if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
              cleanValue = cleanValue.slice(1, -1)
            }
            cleanValue = cleanValue.replace(/\\"/g, '"')
            
            console.log('Clean value:', cleanValue)
            
            try {
              const credentialData = JSON.parse(cleanValue)
              console.log('Parsed credential data:', credentialData)
              
              // If it has credential fields, treat it as a credential
              if (credentialData.hash && credentialData.subject && credentialData.type) {
                const resolvedCredentialId = typeof attributeName === 'string'
                  ? attributeName
                  : `cred/${attributeName.substring(2, 20)}`
                const normalizedFilterId = credentialID && credentialID.startsWith('cred/')
                  ? credentialID
                  : (credentialID ? `cred/${credentialID}` : null)

                if (!credentialID || resolvedCredentialId === credentialID || resolvedCredentialId === normalizedFilterId) {
                  credentials.push({
                    id: resolvedCredentialId,
                    did: credentialData.subject,
                    type: credentialData.type,
                    title: credentialData.degree,
                    name: credentialData.name,
                    hash: credentialData.hash,
                    issuerAddress: event.args.identity
                  })
                  console.log('✓ Credential added to list')
                } else {
                  console.log('✗ Credential ID does not match filter')
                }
              } else {
                console.log('✗ Not a credential (missing required fields)')
              }
            } catch (jsonError) {
              console.log('✗ Not valid JSON:', jsonError.message)
            }
          } catch (error) {
            console.log('✗ Error processing event:', error.message)
          }
        }

        console.log('Credentials found:', credentials.length)

        return res.status(200).json({
          success: true,
          credentials: credentials,
          count: credentials.length
        })

      } catch (error) {
        console.error('List credentials error:', error)
        return res.status(500).json({ error: error.message })
      }
    }

    if (path === '/api/agent/list-credentials' && method === 'GET') {
      try {
        const { ethers } = await import('ethers')
        const url = new URL(req.url, `http://${req.headers.host}`)
        const subjectDID = url.searchParams.get('subjectDID')
        console.log('List credentials request. Subject DID filter:', subjectDID)
        const rpcUrl = process.env.ETH_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        const provider = new ethers.JsonRpcProvider(rpcUrl)
        
        const DID_REGISTRY = '0x03d5003bf0e79c5f5223588f347eba39afbc3818'
        const abi = [
          'function identityOwner(address identity) public view returns (address)',
          'event DIDAttributeChanged(address indexed identity, bytes32 name, bytes value, uint validTo, uint previousChange)'
        ]
        const contract = new ethers.Contract(DID_REGISTRY, abi, provider)

        const filter = contract.filters.DIDAttributeChanged()
        console.log('Using filter: all events')

        const currentBlock = await provider.getBlockNumber()
        console.log('Current block:', currentBlock, 'Querying from:', Math.max(0, currentBlock - 1000000))
        
        const events = await contract.queryFilter(filter, Math.max(0, currentBlock - 1000000), currentBlock)
        console.log('Total events found:', events.length)

        const credentials = []
        
        for (let i = 0; i < events.length; i++) {
          const event = events[i]
          console.log(`\n--- Event ${i + 1}/${events.length} ---`)
          console.log('Raw name (bytes32):', event.args.name)
          console.log('Raw value (bytes):', event.args.value)
          
          try {
            let attributeName = null
            let isCredential = false
            
            // Try to decode as bytes32 string first
            try {
              attributeName = ethers.decodeBytes32String(event.args.name)
              console.log('Decoded attribute name (string):', attributeName)
              isCredential = attributeName.startsWith('cred/')
            } catch (decodeError) {
              // If it's not a valid bytes32 string, it might be a hash
              // Check if the value looks like credential data
              console.log('Not a bytes32 string, checking if value is credential data...')
              attributeName = event.args.name // Use the hash as the name
            }
            
            // Try to parse the value as credential data
            let attributeValue = null
            try {
              attributeValue = ethers.toUtf8String(event.args.value)
              console.log('Decoded attribute value:', attributeValue)
            } catch (utf8Error) {
              console.log('✗ Value is not valid UTF-8, skipping:', utf8Error.message)
              continue // Skip this event if it's not valid UTF-8
            }
            
            // Remove quotes and unescape if needed
            let cleanValue = attributeValue
            if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
              cleanValue = cleanValue.slice(1, -1)
            }
            cleanValue = cleanValue.replace(/\\"/g, '"')
            
            console.log('Clean value:', cleanValue)
            
            try {
              const credentialData = JSON.parse(cleanValue)
              console.log('Parsed credential data:', credentialData)
              
              // If it has credential fields, treat it as a credential
              if (credentialData.hash && credentialData.subject && credentialData.type) {
                if (!subjectDID || credentialData.subject === subjectDID) {
                  credentials.push({
                    id: typeof attributeName === 'string' ? attributeName : `cred/${attributeName.substring(2, 20)}`,
                    did: credentialData.subject,
                    type: credentialData.type,
                    title: credentialData.degree,
                    name: credentialData.name,
                    hash: credentialData.hash,
                    issuerAddress: event.args.identity
                  })
                  console.log('✓ Credential added to list')
                } else {
                  console.log('✗ Credential subject does not match filter')
                }
              } else {
                console.log('✗ Not a credential (missing required fields)')
              }
            } catch (jsonError) {
              console.log('✗ Not valid JSON:', jsonError.message)
            }
          } catch (error) {
            console.log('✗ Error processing event:', error.message)
          }
        }

        console.log('Credentials found:', credentials.length)

        return res.status(200).json({
          success: true,
          credentials: credentials,
          count: credentials.length
        })

      } catch (error) {
        console.error('List credentials error:', error)
        return res.status(500).json({ error: error.message })
      }
    }

    res.status(404).json({ error: 'not found' })
  } catch (err) {
    console.error('Agent error:', err)
    res.status(500).json({ error: err.message || String(err) })
  }
}
