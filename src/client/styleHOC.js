//根目录下创建withStyle.js文件
import React, { Component } from 'react';
//函数返回组件
//需要传入的第一个参数是需要装饰的组件
//第二个参数是styles对象
export default (DecoratedComponent, styles) => {
    return class NewComponent extends Component {

        constructor(props) {
            super(props)
            if (this.props.staticContext) {
                this.props.staticContext.css.push(styles._getCss())
            }
        }

        render() {
            return <DecoratedComponent {...this.props} />
        }
    }
}

