import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import reducer from './reducer'



//获取客户端store
export const getClientStore = () => {
    const defaultState = window.context ? window.context.state : {};
    return createStore(reducer, defaultState, applyMiddleware(thunk));
}

//获取服务端store



export  default createStore(reducer, applyMiddleware(thunk))



