// @ts-check

// 프레임워크 없이 간단한 토이프로젝트 웹 서버 만들어보기

/**
 * 블로그 포스팅 서비스
 * 데이터베이스 사용 x
 * - 로컬 파일을 데이터베이스로 사용할 예정 (JSON)
 * - 인증 로직은 넣지 않는다.
 * - RESTful API를 사용한다. (HTTP의 작은 서비스만 사용한다.
 *   즉, Get하고 뒤에 주소가 붙거나 POST하고 주소가 없는경우 REST의 HTTP 메소드들을 사용
 *   뒤의 주소와 결합되어 어떤것을 나타내는지 알기 쉽다. 테스트하기 편리하고 사람이 보기 편한 구조임.)
 * */

/**
 * nodemon을 이용한 자동 서버 실행 명령어 npm run server
 * 도메인 호출 명령어 http localhost:4000
 */

// HTTP 모듈 설정
const { rejects } = require('assert')
const http = require('http')
const { resolve } = require('path/posix')
const { routes } = require('./api')

const server = http.createServer((req, res) => {
  async function main() {
    // async 함수를 만들어 안에 넣어서 route.callback()를 await할 수 있게 만들어준다
    // 조건에 일치하는 route를 찾는다.
    const route = routes.find(
      (_route) =>
        req.url &&
        req.method &&
        _route.url.test(req.url) &&
        _route.method === req.method
    )

    if (!req.url || !route) {
      res.statusCode = 404
      res.end('Not found.')
      return
    }

    const regexResult = route.url.exec(req.url)

    if (!regexResult) {
      res.statusCode = 404
      res.end('Not found.')
      return
    }

    /** @type {Object.<string, *> | undefined} */
    const reqBody =
      (req.headers['content-type'] === 'application/json' && // 이쪽 콜백 안에서 data를 받아야 하는데 콜백 밖과 연결점이 없기 때문에 promise 를 사용한다.
        // 필요없는 경우에도 데이터를 받아내는 것을 막기 위해 json헤더를 조건지정한다.
        // application/json인 경우에만 돌게 되고 있으면 새 promise를 만들어서 await을 한다.
        // 그게 아니라면 undefined가 돌아간다.
        // 인라인 함수를 만들어서 바로 await하는 것을 확인할 수 있다.
        (await new Promise((resolve) => {
          req.setEncoding('utf-8')
          req.on('data', (data) => {
            try {
              // 데이터를 파싱한 것을 사용해 JSON 오브젝트로 받는다
              resolve(JSON.parse(data))
            } catch {
              // @ts-ignore
              rejects(new Error('Ill-formed json'))
            }
          })
        }))) ||
      undefined

    const result = await route.callback(regexResult, reqBody) // 콜백한 것을 result에 받으며 regexResult를 콜백에 인자로 넘겨준다.
    result.statusCode = result.statusCode

    // body가 string 또는 Object 둘중 하나만 가지도록 분개처리
    if (typeof result.body == 'string') {
      res.end(result.body)
    } else {
      // 무조건 JSON으로 받기 떄문에 헤더 정리를 히고 JSON.stringify를 사용해 바디를 JSON으로 받는다
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify(result.body))
    }
  }

  main()
})

const PORT = 4000

server.listen(PORT, () => {
  console.log(`the server is listening at port: ${PORT}`)
})
