import { combineReducers } from 'redux'
import { homeReducer } from '../client/home/store'

export default combineReducers({
    home: homeReducer,
})