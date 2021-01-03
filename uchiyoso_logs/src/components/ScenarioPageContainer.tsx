import React from 'react'
import ScenarioPage from './ScenarioPage'
import ScenariosMeta from '../ScenariosMeta'
import {useScenarioMeta} from '../lib'

interface Props {
    appBarTitle: string
    scenariosMeta: ScenariosMeta
}

export default function ScenarioPageContainer(props: Props) {
    const {appBarTitle, scenariosMeta} = props
    const scenarioMeta = useScenarioMeta(scenariosMeta.id)
    return (
        <ScenarioPage appBarTitle={appBarTitle} scenariosMeta={scenariosMeta} scenarioMeta={scenarioMeta} />
    )
}