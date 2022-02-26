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

// HTTP 모듈 설정
const http = require('http')

/**
 * Post
 *
 * 포스트 전체 조회 리스트 API
 * GET /posts
 *
 * 특정한 포스트 조회 API
 * GET /posts/:id
 *
 * POST /posts
 *
 */

const server = http.createServer((req, res) => {
  console.log(req.url)

  res.statusCode = 200
  res.end('Hello!')
})

const PORT = 4000

server.listen(PORT, () => {
  console.log(`the server is listening at port: ${PORT}`)
})
