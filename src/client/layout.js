import React from 'react';
import { renderRoutes } from 'react-router-config';
import Header from './header';

function App(props) {

    return (<div>
        <Header />
        {renderRoutes(props.route.routes)}
    </div>)
}
export default App 
