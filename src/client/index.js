//src/client/index.js
import React from 'react';
import { hydrate } from 'react-dom'
import { BrowserRouter, } from 'react-router-dom'
import { renderRoutes } from 'react-router-config'
import routes from '../routes'
import { Provider } from 'react-redux'
import { getClientStore } from '../store'
function App() {
    return (
        <Provider store={getClientStore()}>
            <BrowserRouter>
                <div>
                    {
                        renderRoutes(routes)
                    }
                </div>
            </BrowserRouter>
        </Provider>
    )
}
hydrate(<App />, document.getElementById("root"))