
import { CHANGE_LIST } from "./actionTypes";

const changeList = list => ({ type: CHANGE_LIST, list });

import axios from 'axios'
export const getHomeList = () => {

    return (dispatch) => {

      
        return axios.get('https://lengyuexin.github.io/json/text.json')
            .then((res) => {
                const list = res.data.list.slice(0, 2)

                dispatch(changeList(list))
            }).catch(err=>{
                console.log(JSON.stringify(err))

               
            })
    };
}
