const path = require('path')
const cookieParser = require('cookie-parser')
const express = require('express')

const port = 8088

const app = express()

//设置模版文件夹的位置
app.set('views', path.join(__dirname, 'templates'))

const users = [{
  id: 1,
  email: 'd@qq.com',
  password: '123456',
  gender: 'f',
  avatar: '/upload/user1.jpg',
}]


const posts = [{//帖子
  id: 1,
  userid: 1,
  title: '好吃吗',
  content: '这个菜',
  timestamp: '132456',
  发贴人: 'd@qq.com',

}, {
  id: 2,
  userid: 2,
  title: 'WHO?',
  content: 'Who are you?',
  timestamp: '4545665',
  发贴人: 'a@qq.com',
}]

const comments = [{
  id: 1,
  content: '不好吃',
  userid: 1,
  postid: 2,
  timestamp: 6541514661//时间戳
}, {
  id: 2,
  content: '好吃',
  userid: 1,
  postid: 2,
  timestamp: 654151461//时间戳
}]

//中间件
app.use(cookieParser('hasjkhdjkashk'))//解析cookie

app.use((req, res, next) => {
  console.log(req.method, req.url, req.cookies, req.signedCookies)
  next()
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }))//解析扩展url
app.use(express.static(path.join(__dirname, 'static')))


app.route('/register')
  .get((req, res, next) => {//请求注册
    res.render('register.pug')
  })
  .post((req, res, next) => {//点注册进post
    var user = req.body
    user.id = users.slice(-1)[0].id + 1
    if (users.find(u => u.email == users.email)) {
      res.end('该email已被占用，试试登录一下')
    } else {
      users.push(user)
      res.end('register success')
    }
  })

app.route('/login')
  .get((req, res, next) => {
    res.render('login.pug')
  })
  .post((req, res, next) => {
    var loginInfo = req.body
    var user = users.find(u => u.email == loginInfo.email && u.password == loginInfo.password)
    if (user) {
      res.cookie('loginUser', user.email, {
        maxAge: 3 * 60 * 60 * 1000,
        signed: true,
      })
      res.cookie('gender', user.gender, {
        maxAge: 3 * 60 * 60 * 1000,
        httpOnly: true,
      })
      res.end('login success')
    } else {
      res.end('login info incorrent')
    }
  })

app.get('/logout', (req, res, next) => {
  res.clearCookie('loginUser')//清除cookie
  res.redirect(req.query.next)//回到?next=

})

app.get('/', (req, res, next) => {//请求首页
  res.render('index.pug', { posts: posts })
})

app.get('/post/:id', (req, res, next) => {//请求帖子
  var post = posts.find(post => post.id == req.params.id)
  if (post) {
    var currentComments = comments.filter(comment => comment.postid == post.id)
    res.render('post.pug', {
      post: post,
      comments: currentComments,
      inLogin: req.signedCookies.loginUser
    })
  } else {
    res.status(404).end('您要找的主题不存在')
  }
})

app.listen(port, () => {//监听端口
  console.log('listening to port', port)
})