// 중복되는 코드들의 추상화를 하기 위한 api 파일을 작성한다. (이 파일은 모듈 임)
// @ts-check

// 타입을 미리 정의하여 VScode가 빠르게 문제가 생긴 것을 알려준다,
/**
 * 현재는 jsdoc 사용중
 * jsdoc은 주석을 파악하여 자동으로 타입 변환을 해준다.
 * 타입스크립트가 jddoc를 파싱해서 미리 에러를 내준다.
 * 타입을 미리 써가며 문서화를 하면 코딩할때 편한 장점이 있다.
 *
 * 3. 포스트 작성시 http 호출방법
 * ex) http POST localhost:4000/posts title=hello content=나의컨텐츠
 *
 */

/**
 * @typedef Post
 * @property {string} id
 * @property {string} title
 * @property {string} content
 */

/**
 * @typedef APIResponse
 * @property {number} statusCode
 * @property {string | Object} body
 */

/**
 * @typedef Route
 * @property {RegExp} url
 * @property {'GET' | 'POST'} method
 * @property {(matches: string[], body: Object.<string, *> |  undefined) => Promise<APIResponse>} callback
 */
/** 콜백함수를 정의할때 가장 최선의 방법은 promise를 사용하는 것이다.
 *  콜백에 응답이 돌아오는 것은 비동기함수 인 경우가 많다. 그래서 비동기가 끝나고 결과를 반환해야 하기때문에
 *  promise가 맞다
 */

/* 
RESTful API 서버 만들기
JSON 파일을 데이터베이스로 활용해 저장하기
파일 시스템에 있는 것을 읽어오기 때문에 database.json의 값이 수정되면 결과도 반영된다.
서버가 닫히거나 재시작 되어도 서버는 유지되기 때문에 데이터베이스에 저장된다.
*/

// 파일을 읽기 위해 파일시스템 모듈 require
const fs = require('fs')
const DB_JSON_FILENAME = 'database.json'

// posts들을 읽어오는 함수 지정
/** @returns {Promise<Post[]>} */
async function getPosts() {
  const json = await fs.promises.readFile(DB_JSON_FILENAME, 'utf-8')
  return JSON.parse(json).posts // posts가 가장 위의 key 이기 때문에 posts 지정
}

// 바뀐 posts들을 저장하기 위한 savaPosts 만들기
/**
 * @param {Post[]} posts
 */
async function savePosts(posts) {
  const content = {
    posts,
  }

  return fs.promises.writeFile(
    DB_JSON_FILENAME,
    JSON.stringify(content),
    'utf-8'
  )
  // 바뀐 posts들의 content를 작성하여 JSON형식으로 변환 후 promises 콜백함수를 이용해 database.json에 저장하고.
  // async함수는 결국 promise를 돌려주는 것이기 때문에 await을 사용하지 않아도 된다.
}

// 모듈에서 내보내는 것이 routes (node의 문법)
/** @type {Route[]} */
const routes = [
  // 1. 전체 posts 읽기
  {
    url: /\/posts$/,
    method: 'GET',
    callback: async () => ({
      // TODO: implement
      statusCode: 200,
      body: await getPosts(),
    }),
  },

  // 2. 하나의 posts만 찾기
  {
    url: /^\/posts\/([a-zA-Z0-9-_]+)$/,
    method: 'GET',
    callback: async (matches) => {
      const postId = matches[1]
      if (!postId) {
        return {
          statusCode: 404,
          body: 'Not found',
        }
      }

      const posts = await getPosts()

      // post에 id를 비교 일치하는지 아닌지
      const post = posts.find((_post) => _post.id === postId)

      if (!post) {
        return {
          statusCode: 404,
          body: 'Not found',
        }
      }

      // postId가 있는 경우
      return {
        statusCode: 200,
        body: post,
      }
    },
  },

  //3. 새로운 posts를 만드는 API request body의 정보가 필요한다.
  {
    url: /\/posts$/,
    method: 'POST',
    callback: async (_, body) => {
      if (!body) {
        return {
          statusCode: 400,
          body: 'Ill-formed request.',
        }
      }

      /** @type {string} */
      /** eslint-disable-next-line prefer-destructuring */
      const title = body.title
      const newPost = {
        // 다시 만드는 이유는 바디에 똑같은 값을 리턴해줄 수 있다. 그래서 어떤 것이 새로 만들어졌는지 API 응답으로 알려줄 수 있게 된다.
        id: title.replace(/\s/g, '_'),
        title,
        content: body.content,
      }

      // 저장을 하기 위해 현재 posts들을 가져온다.
      const posts = await getPosts()
      posts.push(newPost)
      savePosts(posts)

      return {
        statusCode: 200,
        body: newPost,
      }
    },
  },
]

module.exports = {
  // module은 노드의 글로벌 객체 그래서 main.js와 같은 다른 파일에서 모듈을 통해 routes를 사용할 수 있다.
  routes,
}
