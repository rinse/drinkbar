export default interface ScenarioLog {
    id: string
    name: string
    scenarioUrl: string
    scenarioOriginalName: string
    logs: {id: string, name: string, iconChar: string}[]
    arts: string[]
}
