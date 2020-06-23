import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getHomeList } from './store/actionCreators'
import homeCss from './home.css';
import StyleHOC from '../styleHOC';
import { Helmet } from 'react-helmet';

import { Desc } from './style';


class Home extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    if (!this.props.list.length) {
      this.props.getHomeList()
    }
  }
  render() {
    return (<div>

      <Helmet>
        <title>服务端渲染</title>
        <meta name="description" content="react ssr" />
      </Helmet>

      <Desc>styled-component</Desc>

      <div>
        {
          this.props.list.map(item => <div key={item.id}>{item.text}</div>)
        }

      </div>


    </div>)
  }
}



const mapStateToProps = state => ({
  list: state.home.list,
})
const mapDispatchToProps = dispatch => ({
  getHomeList() {
    dispatch(getHomeList());
  }
})


const HomeHOC = connect(mapStateToProps, mapDispatchToProps)(StyleHOC(Home, homeCss));

HomeHOC.loadData = (store) => {
  return store.dispatch(getHomeList())
}
export default HomeHOC;