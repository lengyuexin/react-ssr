## react-ssr

###  环境搭建


|                                                              |                             |
| ------------------------------------------------------------ | --------------------------- |
| webpack webpack-cli babel-loader @babel/core                 | 打包前后端代码并实时编译    |
| @babel/preset-env                                            | 识别import语法，其他es6语法 |
| @babel/preset-react                                          | 识别jsx语法                 |
| webpack-merge                                                | 合并webpack配置             |
| webpack-node-externals                                       | 跳过node_modules 打包       |
| nodemon                                                      | 服务端代码热更新            |
| express                                                      | Node.JS框架                 |
| axios                                                        | 异步数据请求                |
| react react-dom react-router-dom<br />redux react-redux redux-thunk <br />react-router-config | react生态依赖               |
| npm-run-all                                                  | npm脚本批处理               |
| isomorphic-style-loader                                      | 服务端css处理               |
| react-helment                                                | seo相关                     |
| css-loader style-loader                                      | webpack 识别 css            |
| babel-plugin-styled-components                               | 识别styled-components       |


**1. webpack.base.config.js**

```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react']
                        }
                    }

                ]
            }
        ]
    }
}

```

**2. webpack.client.config.js**

```js
const path = require('path')
const webpackMerge = require("webpack-merge")
const baseConf = require("./webpack.base.config")
const clientConf = {
    mode: 'development',
    entry: './src/client/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, './public')
    },
}
module.exports = webpackMerge(baseConf, clientConf)

```

**3. webpack.server.config.js**

```js
const path = require('path')
const nodeExternals = require('webpack-node-externals');
const webpackMerge = require("webpack-merge")
const baseConf = require("./webpack.base.config")
const serverConf = {
    mode: 'development',
    target: 'node',
    externals: [nodeExternals()],
    entry: './src/server/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './build')
    },
}
module.exports = webpackMerge(baseConf, serverConf)
```

**4. npm脚本**

```json

//运行  npm start
  "scripts": {
    "start": "npm-run-all --parallel  dev:** ",
    "dev:start": "nodemon  ./build/bundle.js ",
    "dev:build:client": "webpack --config webpack.client.config.js --watch",
    "dev:build:server": "webpack --config webpack.server.config.js --watch"
  },

```


### hello world

```js
import express from 'express'
const app = new express();
app.get("/", (req, res) => {
    res.send(`
        <html>
            <head>
                <title>react-ssr</title>
            </head>
            <body>
                react ssr
            </body>
        </html>
    `)
})

app.listen(3000, () => {
    console.log('run server 3000')
})

```

### 服务端运行前端代码

> 前端代码转字符串后服务端直出,但此时尚无法完成交互逻辑，如事件绑定


前端代码

```js
import React from 'react';
function App() {
    return <h1 >hello ssr </h1>
}
export default App
```
服务端代码

```js
import express from 'express'
import {renderToString} from 'react-dom/server'
import React from 'react'
import App from '../client/home'
const app = new express();
app.get("/", (req, res) => {
const content=renderToString(<App/>)
    res.send(`
        <html>
            <head>
                <title>react-ssr</title>
            </head>
            <body>
                 ${content}
            </body>
        </html>
    `)
})

app.listen(3000, () => {
    console.log('run server 3000')
})
```


###  同构

> 同构指的是一套代码在服务端和客户端运行，服务端直出html结构，客户端接管页面进行渲染。

前端使用hydrate

```js
//src/client/index
import React from 'react';
import { hydrate } from 'react-dom'
import Home from './home'
hydrate(<Home />,document.getElementById("root"))

//src/client/home

import React from 'react';
const handleClick = () => {
    alert('click')
}
function App() {
    return <div onClick={handleClick}>hello ssr </div>
}
export default App

```

后端返回的html加载静态资源开放的js脚本

```js

import express from 'express'
import {renderToString} from 'react-dom/server'
import React from 'react'
import App from '../client/home'
const app = new express();
//这个也是webpack.client.config.js 的出口路径
app.use(express.static('public'))
app.get("/", (req, res) => {
const content=renderToString(<App/>)
//返回的html要加一个container(root), 加载js脚本
    res.send(`
        <html>
            <head>
                <title>react-ssr</title>
            </head>
            <body>
            <div id="root">${content}</div>
            </body>
            <script src="/index.js"></script>
        </html>
    `)
})

app.listen(3000, () => {
    console.log('run server 3000')
})
```


### 路由

> 前端路由使用方式不变，后端使用静态路由完成同构


1. 首次访问界面，服务端直出路由匹配到的组件
2. 之后的路由跳转皆由浏览器接管


src/routes.js

```js
import React from 'react'
import { Route } from 'react-router-dom'
import Home from './client/home'
import List from './client/list'
export default (
    <div>
        <Route exact path="/" component={Home} />
        <Route exact path="/list" component={List} />
    </div>
)
```

src/client/index.js

```js
import React from 'react';
import { hydrate } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import Routes from '../routes'
function App() {
    return (
        <BrowserRouter>
            {Routes}
        </BrowserRouter>
    )
}
hydrate(<App />, document.getElementById("root"))
```


src/client/header.js

```js
import React from 'react';
import { Link } from 'react-router-dom'
function Header() {
    return (
        <div>
            <Link to="/" >Home</Link>
            <Link to="/list" >List</Link>
        </div>
    )
}
export default Header
```


src/client/home.js

```js
import React from 'react';
import Header from './header'
const handleClick = () => {
    alert('click')
}
function Home() {
    return (
        <div>
            <Header/>
            <div onClick={handleClick}> hello ssr </div>
        </div>
    )
}
export default Home
```

src/client/list.js

```js
import React from 'react';
import Header from './header'
function List() {
    return (
        <div>
            <Header />
            <div> list</div>
        </div>
    )
}
export default List
```

服务端使用StaticRouter

```js
//src/server/utils.js
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import Routes from '../routes' //服务端加载路由
export const render = (req) => {
    const content = renderToString(
        <StaticRouter location={req.path} >
            {Routes}
        </StaticRouter>
    )
    return `
        <html>
            <head>
                <title>react-ssr</title>
            </head>
            <body>
            <div id="root">${content}</div>
            </body>
            <script src="/index.js"></script>
        </html>
    `
}
```

src/server/index.js

```js
import express from 'express'
import {render} from './utils'
const app = new express();
app.use(express.static('public'))
app.get("*", (req, res) => {
    res.send(render(req))
})

app.listen(3000, () => {
    console.log('run server 3000')
})

```

效果图

![路由切换](https://img-blog.csdnimg.cn/20200618152339136.gif)



### 引入redux

> 前端redux使用方式不变，后端需要给静态路由Provider一份store



**0. 此时目录结构**

![此时目录结构](https://img-blog.csdnimg.cn/20200618174721761.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyODEzNDkx,size_16,color_FFFFFF,t_70)

**1. 全局store创建**

```js
//src/store/index.js
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import reducer from './reducer'
const store = createStore(reducer, applyMiddleware(thunk));
export default store;

//src/store/reducer.js

import { combineReducers } from 'redux'
import { homeReducer } from '../client/home/store'
export default combineReducers({
    home: homeReducer,
})

```
**2. home组件store维护**

```js
//src/client/home/store/index.js
import homeReducer from './reducer';
import * as actionCreators from './actionCreators';
import * as actionTypes from './actionTypes';
export { homeReducer, actionCreators, actionTypes };


//src/client/home/store/reducer.js
import { CHANGE_LIST } from "./actionTypes";
const defaultState = {
    list: []
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case CHANGE_LIST:
            return { 
                ...state, 
                list:action.list
             }
        default:
            return state;
    }
}

//src/client/home/store/actionTypes.js
export const CHANGE_LIST = 'HOME/CHANGE_LIST';

//src/client/home/store/actionCreators.js
import axios from 'axios';
import { CHANGE_LIST } from "./actionTypes";
const changeList = list => ({ type: CHANGE_LIST, list });
export const getHomeList = () => {
    return (dispatch) => {
        axios.get('https://lengyuexin.github.io/json/text.json')
            .then((res) => {
                const list = res.data.list.slice(0, 10)
                dispatch(changeList(list))
            });
    };
}

```


**3. home组件数据获取**


```js

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actionCreators } from './store'

class Home extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    this.props.getHomeList()
  }
  render() {
    return this.props.list.map(item => <div key={item.id}>{item.text}</div>)
  }
}
const mapStateToProps = state => ({
  list: state.home.list,
})
const mapDispatchToProps = dispatch => ({
  getHomeList() {
    dispatch(actionCreators.getHomeList());
  }
})
export default connect(mapStateToProps, mapDispatchToProps)(Home)

```

**4. 前端路由传递store**

```js
//src/client/index.js
import React from 'react';
import { hydrate } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import Routes from '../routes'
import { Provider } from 'react-redux'
import store from '../store'
function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                {Routes}
            </BrowserRouter>
        </Provider>
    )
}
hydrate(<App />, document.getElementById("root"))
```


**5. 后端路由传递store**


```js
//src/server/index.js
import express from 'express'
import {render} from './utils'
const app = new express();
app.use(express.static('public'))
app.get("*", (req, res) => {
    res.send(render(req))
})

app.listen(3000, () => {
    console.log('run server 3000')
})

//src/server/utils
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import Routes from '../routes'
import store from '../store'
import { Provider } from 'react-redux'
export const render = (req) => {
    const content = renderToString(
        <Provider store={store}>
            <StaticRouter location={req.path} >
                {Routes}
            </StaticRouter>
        </Provider>
    )
    return `
        <html>
            <head>
                <title>react-ssr</title>
            </head>
            <body>
            <div id="root">${content}</div>
            </body>
            <script src="/index.js"></script>
        </html>
    `

}

```


**6. 效果图**

![接入redux获取数据](https://img-blog.csdnimg.cn/20200618175850827.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyODEzNDkx,size_16,color_FFFFFF,t_70)


**7. 现存问题**

  并非真正意义上的服务端渲染，因为在后端无法执行组件的挂载方法请求数据
  界面上显示的数据来源前端加载js代码后的异步请求，本质是客户端渲染
  查看源码，数据为空

  ![现存问题](https://img-blog.csdnimg.cn/20200618180244881.png)


### 数据预加载


1. 为组件本身定义一个数据预加载的函数loadData，该函数在服务端直出页面前调用，填充服务端store
2. 服务端匹配路由对应的组件，调用匹配到的组件的loadData函数，将服务端尚且为空的store传入
3. 让客户端数据请求的action返回一个promise,这样loadData也会返回一个promise
4. 服务端使用Promise.all方法,等待所有异步结果执行完，服务端store数据已经填充完毕，直出带数据的页面

**1. 路由配置调整**

```js
//src/routes.js
import Home from './client/home'
import Show from './client/show'
export default [
    {
        path: "/",
        component: Home,
        exact: true,
        loadData: Home.loadData,//服务端获取异步数据的函数
        key: 'home'
    },
    {
        path: '/show',
        component: Show,
        exact: true,
        key: 'show'
    }
];


```


**2. 前端路由改造**

```js
//src/clict/index.js
import React from 'react';
import { hydrate } from 'react-dom'
import { BrowserRouter,Route } from 'react-router-dom'
import Routes from '../routes'
import { Provider } from 'react-redux'
import store from '../store'
function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <div>
                    {
                        // 将配置属性逐一传入
                        Routes.map(route => {
                           return <Route {...route} />
                        })
                    }
                </div>
            </BrowserRouter>
        </Provider>
    )
}
hydrate(<App />, document.getElementById("root"))

```

**3. 后端路由改造**

```js
//src/server/utils.js
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter,Route } from 'react-router-dom'
import Routes from '../routes'
import store from '../store'
import { Provider } from 'react-redux'
export const render = (req) => {
    const content = renderToString(
        <Provider store={store}>
            <StaticRouter location={req.path} >
                <div>
                    {
                        Routes.map(route => {
                            return <Route {...route} />
                        })
                    }
                </div>
            </StaticRouter>
        </Provider>
    )
    return `
        <html>
            <head>
                <title>react-ssr</title>
            </head>
            <body>
            <div id="root">${content}</div>
            </body>
            <script src="/index.js"></script>
        </html>
    `

}

```

**4. 让前端数据请求的action返回promise**

```js

export const getHomeList = () => {
    return  (dispatch) => {
        //注意这里的return
       return  axios.get('https://lengyuexin.github.io/json/text.json')
            .then((res) => {
                const list = res.data.list.slice(0, 10)
                dispatch(changeList(list))
            });
    };
}

```



**5. 前端组件定义数据预加载的静态方法**

```js

//入参为服务端store,返回一个填充好数据的store,形式为promise
Home.loadData=(store)=>{
  return store.dispatch(getHomeList())
}

```


**6. 服务端根据路由匹配对应的组件**


```js
//src/server/index.js
import express from 'express'
//这个方法用于匹配路由
import { matchRoutes } from 'react-router-config'
import { render } from './utils'
import routes from '../routes'
import store from '../store'

const app = new express();
app.use(express.static('public'))
app.get("*", (req, res) => {
    const matchedRoutes = matchRoutes(routes, req.path);
    const promises = [];
    matchedRoutes.forEach(item => {
        if (item.route.loadData) {
            promises.push(item.route.loadData(store));
        };
    });
    //等待所有异步结果执行完毕，服务端直出页面
    Promise.all(promises).then(_=>{
        res.send(render({
            req,
            store,
            routes
        }))

    })
})

app.listen(3000, () => {
    console.log('run server 3000')
})


//src/server/utils.js

import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
export const render = ({req,store,routes}) => {
    const content = renderToString(
        <Provider store={store}>
            <StaticRouter location={req.path} >
                <div>
                    {
                        // 将配置属性逐一传入
                        routes.map(route => {
                            return <Route {...route} />
                        })
                    }
                </div>
            </StaticRouter>
        </Provider>
    )
    return `
        <html>
            <head>
                <title>react-ssr</title>
            </head>
            <body>
            <div id="root">${content}</div>
            </body>
            <script src="/index.js"></script>
        </html>
    `
}

```

**7. 效果图**

![服务端直出带数据的页面](https://img-blog.csdnimg.cn/2020061911323345.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyODEzNDkx,size_16,color_FFFFFF,t_70)


**8. 现存问题**

注释掉客户端组件挂载阶段的数据请求，页面无数据，查看源码，数据已经存在
原因：客户端会再度运行一次代码，重置客户端store为空，这个store与已有数据的服务端store不同步

### 数据的注水与脱水

在服务端直出带数据的页面时，将store存储在全局变量中，为前端store数据获取做准备的过程叫做数据注水。


```html

 <script>
    window.context = {
        state: ${JSON.stringify(store.getState())}
    }
</script>


```



前端获取来自全局变量中的数据并填充自身，用于页面数据渲染的过程叫数据脱水。

```js

//src/store/index.js

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import reducer from './reducer'
const store = createStore(reducer, applyMiddleware(thunk));

//获取客户端store
export const getClientStore = () => {
    const defaultState = window.context ? window.context.state : {};
    return createStore(reducer, defaultState, applyMiddleware(thunk));
}
export default store;


//src/client/index.js

//...
import {getClientStore} from '../store'
function App() {
    return (
        <Provider store={getClientStore()}>
            // ....
        </Provider>
    )
}

//...


```

通过数据的注水与脱水解决客户端和服务端数据不同步的问题。

```js
 componentDidMount() {

     //服务端只会在第一次路由匹配的时候进行直出
     //后续路由由浏览器接管
     //这意味着第一次访问的页面有可能是没数据的，如先访问/show，后访问/
     //所以这里需要做一个判断，不重复渲染，但如果服务端没拿到数据，就是客户端渲染
    if (!this.props.list.length) {
      this.props.getHomeList()
    }
  }

```

### 多级路由


src/client/layout.js

```js

import React from 'react';
import { renderRoutes } from 'react-router-config';
import Header from './header';
function App(props) {
    return (
         <div>
            <Header />
            {renderRoutes(props.route.routes)}
        </div>
   )
}
export default App 

```


src/routes.js

```js

import Home from './client/home'
import Show from './client/show'
import Layout from './client/layout'
export default [{
    path: '/',
    component: Layout,
    routes: [
        {
            path: "/",
            component: Home,
            exact: true,
            loadData: Home.loadData,
            key: 'home'
        },
        {
            path: '/show',
            component: Show,
            exact: true,
            key: 'show'
        }
    ]
},

];


```

src/client/index.js

```js
//...
<BrowserRouter>
    <div>
        {renderRoutes(routes)}
    </div>
</BrowserRouter>
//...

```
src/server/utils.js

```js
//...
<StaticRouter location={req.path} >
    <div>
            {renderRoutes(routes)}
    </div>
</StaticRouter>
//...

```


### 打包css

安装style-loader,css-loader和用于服务端css处理的isomorphic-style-loader。
客户端引入css文件，在服务端渲染前通过staticContext将样式数据传递到服务端。
服务端StaticRouter接收一个context参数，在renderToString结束，样式获取完毕。
服务端直出context中的css样式数据，前端接管后渲染样式。



**webpack.client.config.js**

```js

const path = require('path')
const webpackMerge = require("webpack-merge")
const baseConf = require("./webpack.base.config")

const clientConf = {
    mode: 'development',
    entry: './src/client/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, './public')
    },
    //增加css处理loader
    module: { 
        rules: [ 
            {
                test: /\.css$/,
                use: ['style-loader', {
                    loader:'css-loader',
                    options:{
                        modules:true
                    }
                }] 
            }
        ]
    }

}

module.exports = webpackMerge(baseConf, clientConf)

```


**webpack.server.config.js**

```js

const path = require('path')
const nodeExternals = require('webpack-node-externals');
const webpackMerge = require("webpack-merge")
const baseConf = require("./webpack.base.config")

const serverConf = {
    mode: 'development',
    target: 'node',
    externals: [nodeExternals()],
    entry: './src/server/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './build')
    },
    //配置服务端css处理loader
    module: {
        rules: [{
            test: /\.css?$/,
            use: ['isomorphic-style-loader', {
                loader: 'css-loader',
                options: {
                    modules: true
                }
            }]
        }]
    },

}

module.exports = webpackMerge(baseConf, serverConf)

```


**前端填充context(staticContext)**


```js

import homeCss from './home.css';

//...
constructor(props) {
    super(props)
    if (this.props.staticContext) {
        this.props.staticContext.css.push(styles._getCss())
    }
}
//...

```

**server端获取context**

```js

 let context={css:[]}//初始化
 const content = renderToString(
        <Provider store={store}>
            <StaticRouter location={req.path} context={context} >
                <div>
                     {renderRoutes(routes)}
                </div>
            </StaticRouter>
        </Provider>
    )
    //renderToString后context已经获取到样式数据
    const cssStr = context.css.length ? context.css.join('\n') : '';

    //服务端直出

    return `
        <html>
            <head>
                <title>react-ssr</title>
                <style>${cssStr}</style>
            </head>
            <body>
            <div id="root">${content}</div>
            </body>
            <script src="/index.js"></script>
            <script>
                window.context = {
                    state: ${JSON.stringify(store.getState())}
                }
            </script>
        </html>
    `
```

**代码优化-高阶组件**

为避免带样式的组件重复书写constructor中的样式注入代码，可定义一个接收组件和样式，并返回带样式组件的高阶组件


```js
//src/client/StyleHOC.js
import React, { Component } from 'react';
export default (Comp, styles) => {
    return class CompWithStyle extends Component {
        constructor(props) {
            super(props)
            if (this.props.staticContext) {
                this.props.staticContext.css.push(styles._getCss())
            }
        }
        render() {
            return <Comp {...this.props} />
        }
    }
}

```

**高阶组件的数据预加载**

应用高阶组件后，数据预加载方法loadData要定义在高阶组件上而不是原组件

```js

//...
const HomeHOC = connect(mapStateToProps, mapDispatchToProps)(StyleHOC(Home, homeCss));

HomeHOC.loadData = (store) => {
  return store.dispatch(getHomeList())
}
export default HomeHOC;

//...
```

### SEO

使用react-helmet完成seo,需要前端编写seo相关代码，服务端获取后直出

前端代码
```js
import { Helmet } from 'react-helmet';

//...

render(){
    return (
        //...
      <Helmet>
        <title>服务端渲染</title>
        <meta name="description" content="react ssr" />
      </Helmet>
      //...
    )
}

//...

```


后端代码

```js

//该方法放在renderToString之后
 const helmet = Helmet.renderStatic();

 //直出代码
//...
  `<head>
    <title>react-ssr</title>
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
 </head>`
//...
```




### 引入styled-components

需要安装babel插件，前端使用方法不变，后端要做一些同构处理


```js
//src/server/utils
import { ServerStyleSheet,StyleSheetManager } from 'styled-components';
//样式初始化
const sheet = new ServerStyleSheet();
    const content = renderToString(
//收集样式
        <StyleSheetManager sheet={sheet.instance}>
            <Provider store={store}>
                <StaticRouter location={req.path} context={context} >
                    <div>
                        {renderRoutes(routes)}
                    </div>
                </StaticRouter>
            </Provider>
        </StyleSheetManager>
    )

   //获取样式表 <style>...</style>
    const styles = sheet.getStyleTags();

    //... 直出时带上，不需额外加style标签
    `<head>
            <title>react-ssr</title>
             ${styles}
    </head>`
    //...

```