//src/server/index.js
import express from 'express'
import { matchRoutes } from 'react-router-config'
import { render } from './utils'
import routes from '../routes'
import  store from '../store'
const app = new express();
app.use(express.static('public'))


app.get("*", (req, res) => {
    // 根据路由的路径，来往store里面加数据
    const matchedRoutes = matchRoutes(routes, req.path);
    const promises = [];
    matchedRoutes.forEach(item => {
        if (item.route.loadData) {
            promises.push(item.route.loadData(store))
        };
    });
    //等待所有异步结果执行完毕，服务端直出页面
    Promise.all(promises).then(_ => {

      const context={css:[]}
        res.send(render({
            req,
            store,
            routes,
            context
        }))

    })
})

app.listen(3004, () => {
    console.log('run server 3004')
})