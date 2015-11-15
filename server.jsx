import express from 'express';
import {join as pathJoin } from 'path';
import {readFile} from 'fs';
import React from 'react';
import { RoutingContext, match as routeMatch } from 'react-router';
import createLocation from 'history/lib/createLocation';
import routes from 'routes';
import * as _ from 'lodash';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import * as reducers from 'reducers';
import fetchComponentData from 'lib/fetchComponentData';

const app = express();
export default app;

app.use((req, res) => {
    const location = createLocation(req.url);
    const reducer = combineReducers(reducers);
    const store = createStore(reducer);

    routeMatch(
        { routes, location },
        (err, redirectLocation, renderProps) => {
            if (err) {
                console.error(err);
                return res.status(500).end('Internal server error');
            }

            if (!renderProps) {
                return res.status(404).end('Page not found');
            }

            const componentHTML = React.renderToString(
                <Provider store={store}>
                    {() => <RoutingContext {...renderProps} />}
                </Provider>
            );
            const initialState = store.getState();

            Promise.all([
                fetchComponentData(store.dispatch, renderProps.components, renderProps.params),
                readTemplate()
            ])
                .then(function (data) {
                    res.end(data[1])
                })
                .catch(err => res.end(err.message));

            function readTemplate() {
                return new Promise(function (resolve, reject) {
                    readFile(pathJoin(__dirname, 'index.html'), function (err, data) {
                        if (err) {
                            return reject('Error in reading "index.html"');
                        }

                        return resolve(_.template(data)({
                            componentHTML,
                            initialState: JSON.stringify(initialState)
                        }));
                    });
                });

            }

        });
});

