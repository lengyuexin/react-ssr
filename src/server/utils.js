//src/server/utils
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter, } from 'react-router-dom'
import { renderRoutes } from 'react-router-config'
import { Provider } from 'react-redux'
import { Helmet } from 'react-helmet';
import { ServerStyleSheet,StyleSheetManager } from 'styled-components';

export const render = ({ req, store, routes, context }) => {

    const sheet = new ServerStyleSheet();

    const content = renderToString(

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

    const styles = sheet.getStyleTags();



    const cssStr = context.css.length ? context.css.join('\n') : '';
    const helmet = Helmet.renderStatic();


    return `
        <html>
            <head>
                <title>react-ssr</title>
                <style>${cssStr}</style>
                ${styles}
                ${helmet.title.toString()}
                ${helmet.meta.toString()}
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

}