import {useEffect, useState} from 'react'
import ScenariosMeta from './ScenariosMeta'
import ScenarioMeta from './ScenarioMeta'

function useRemoteFile<T>(mapper: (response: Response) => Promise<T>, url: string, init?: RequestInit): T | undefined {
    const [data, setData] = useState<any>()
    useEffect(() => {
        void (async () => {
            setData(await fetch(url, init).then(data => mapper(data)))
        })().catch(error => {
            console.error(`Failed to fetch ${url}`, error)
        })
    }, [])
    return data
}

export function useScenariosMeta(): ScenariosMeta[] {
    const metaFileName = `${process.env.PUBLIC_URL}/scenarios/meta.json`
    const meta = useRemoteFile(data => data.json(), metaFileName)
    return meta ?? []
}

export function useScenarioMeta(scenarioId: string): ScenarioMeta {
    const playerMetaKey = `${process.env.PUBLIC_URL}/scenarios/${scenarioId}/meta.json`
    const meta = useRemoteFile(data => data.json(), playerMetaKey)
    return meta ?? { logs: [], images: [] }
}
