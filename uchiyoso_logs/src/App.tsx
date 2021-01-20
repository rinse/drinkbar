import React from 'react'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import RootPage from './components/RootPage'
import ScenarioPageContainer from './components/ScenarioPageContainer'
import {useScenariosMeta} from './lib'
import {MuiThemeProvider} from '@material-ui/core'
import {theme} from './MuiTheme'

function App() {
    const title = '感情ドリンクバー'
    const scenarioMeta = useScenariosMeta()
    return (
        <MuiThemeProvider theme={theme}>
            <Router>
                <Route exact path='/'>
                    <RootPage appBarTitle={title} scenarioMeta={scenarioMeta} />
                </Route>
                {scenarioMeta.map(meta => (
                    <Route exact path={`/${meta.id}`} key={meta.id}>
                        <ScenarioPageContainer appBarTitle={title} scenariosMeta={meta} />
                    </Route>
                ))}
            </Router>
        </MuiThemeProvider>
    );
}

export default App
