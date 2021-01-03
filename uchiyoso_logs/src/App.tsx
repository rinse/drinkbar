import React from 'react'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import RootPage from './components/RootPage'
import ScenarioPageContainer from './components/ScenarioPageContainer'
import {useScenariosMeta} from './lib'

function App() {
    const title = '感情ドリンクバー'
    const scenarioMeta = useScenariosMeta()
    return (
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
    );
}

export default App
