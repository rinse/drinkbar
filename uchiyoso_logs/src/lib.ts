import {useEffect, useState} from 'react'
import ScenariosMeta from './ScenariosMeta'
import ScenarioMeta from './ScenarioMeta'

interface Resource<T> {
    data: T
    isLoading: boolean
    error?: Error
}

function useRemoteResource<T, U extends T>(initialState: T, fetchResource: () => Promise<U>): Resource<T> {
    const [data, setData] = useState<T>(initialState)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | undefined>(undefined)
    useEffect(() => {
        void (async () => {
            try {
                setIsLoading(true)
                setData(await fetchResource())
            } catch (e) {
                setError(e)
            } finally {
                setIsLoading(false)
            }
        })()
    })
    return {data, isLoading, error}
}

export function useScenariosMeta(): ScenariosMeta[] {
    const metaFileName = `${process.env.PUBLIC_URL}/scenarios/meta.json`
    const {data, error} = useRemoteResource([], async () => {
        return fetch(metaFileName).then(data => data.json())
    })
    if (error) {
        console.error(`Failed to fetch ${metaFileName}`, error)
    }
    return data
}

export function useScenarioMeta(scenarioId: string): ScenarioMeta {
    const playerMetaKey = `${process.env.PUBLIC_URL}/scenarios/${scenarioId}/meta.json`
    const {data, error} = useRemoteResource({ logs: [], images: [] }, async () => {
        return fetch(playerMetaKey).then(data => data.json())
    })
    if (error) {
        console.error(`Failed to fetch ${playerMetaKey}`, error)
    }
    return data
}
