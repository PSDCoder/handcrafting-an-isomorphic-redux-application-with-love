import React from 'react';
import Router from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import routes from '../shared/routes';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import * as reducers from 'reducers';
import { fromJS } from 'immutable';
import { applyMiddleware } from 'redux';
import promiseMiddleware from 'lib/promiseMiddleware';

const history = createBrowserHistory();
let initialState = window.__INITIAL_STATE__;

Object
    .keys(initialState)
    .forEach(key => {
        initialState[key] = fromJS(initialState[key]);
    });

const reducer = combineReducers(reducers);
const store = applyMiddleware(promiseMiddleware)(createStore)(reducer);

React.render(
    <Provider store={store}>
        {() =>
            <Router children={routes} history={history} />
        }
    </Provider>,
    document.getElementById('react-view')
);
let initialScript = document.getElementById('initial-state');
initialScript.parentNode.removeChild(initialScript);