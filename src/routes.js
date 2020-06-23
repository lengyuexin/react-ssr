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
            loadData: Home.loadData,//服务端获取异步数据的函数
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

