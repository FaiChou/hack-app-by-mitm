const AnyProxy = require('anyproxy')

const PORT_PROXY = 8765
const SIP_URL = 'https://api.sipapp.io/2.0/trial'
const PIN_MAP = {
  '0': 'b',
  '1': 'F',
  '2': '7',
  '3': 'A',
  '4': '1',
  '5': 'e',
  '6': 'K',
  '7': '1',
  '8': 'Z',
  '9': 'c',
}

const rule = {
  summary: 'Hack Sip!',
  *beforeDealHttpsRequest({ host, _req }) {
    console.log('😅 deal with ', host)
    if (host.includes('api.sipapp.io')) {
      console.log('🤪 sipapp:', _req.httpVersion, _req.method)
      return true
    }
    if (host.includes('restapi')) {
      return true
    }
    if (host.includes('in.appcenter.ms')) {
      return true
    }
    return false
  },
  *beforeSendRequest({ url, requestData }) {
    console.log('🙃 beforeSendRequest', url)
    if (url === SIP_URL) {
      const { pin, id } = JSON.parse(requestData)
      const match = pin.toString().split().reduce((num, str) => str+PIN_MAP[num])
      const body = JSON.stringify({
        build: 200,
        environment: 'production',
        match,
        status: 200,
        success: true,
        trial: {
          id,
          days: 15,
          remaining: 15,
          date: '2020-02-23',
          name: 'FaiChou-MBP'
        },
        version: '2.0'
      })
      return {
        response: {
          body,
          statusCode: 200,
          header: { 'content-type': 'application/json' }
        }
      }
    }
    if (url.includes('in.appcenter.ms/logs?api-version')) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            response: {
              body: '123',
              statusCode: 200,
              header: { 'content-type': 'text/html' }
            }
          })
        }, 5000);
      })
    }
  },
  *beforeSendResponse({ url, requestData }) {
    console.log('😋 beforeSendResponse', url)
    if (url === SIP_URL) {
      const { pin, id } = JSON.parse(requestData)
      const match = pin.toString().split().reduce((num, str) => str+PIN_MAP[num])
      const body = JSON.stringify({
        build: 200,
        environment: 'production',
        match,
        status: 200,
        success: true,
        trial: {
          id,
          days: 15,
          remaining: 15,
          date: '2020-02-23',
          name: 'FaiChou-MBP'
        },
        version: '2.0'
      })
      return {
        response: {
          body,
          statusCode: 200,
          header: { 'content-type': 'application/json' }
        }
      }
    }
  },
  *onError({ url }, error) {
    console.log('[onError]:', url, error)
  },
  *onConnectError({ url }, error) {
    console.log('[onConnectError]:', url, error)
  },
}

const OPTIONS = {
  rule,
  port: PORT_PROXY,
  forceProxyHttps: true,
  dangerouslyIgnoreUnauthorized: true
}

const server = new AnyProxy.ProxyServer(OPTIONS)
server.on('ready', () => {
  console.log('😁 [PROXY READY]')
})
server.on('error', e => {
  console.error('😭 [PROXY ERROR]:', e)
})

function start() {
  if (!AnyProxy.utils.certMgr.ifRootCAFileExists()) {
    console.log('😡 未发现证书')
    return
  }
  server.start()
  AnyProxy.utils.systemProxyMgr.enableGlobalProxy('127.0.0.1', PORT_PROXY, 'http')
  AnyProxy.utils.systemProxyMgr.enableGlobalProxy('127.0.0.1', PORT_PROXY, 'https')
}

function close() {
  server.close()
  AnyProxy.utils.systemProxyMgr.disableGlobalProxy()
}

start()
