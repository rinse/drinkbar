import React from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";
import ScenarioLog from "./ScenarioLog";
import RootPage from "./components/RootPage";
import ScenarioPage from "./components/ScenarioPage";

const scenarioLogs: ScenarioLog[] = [
    {
        id: "shinhaya",
        name: "心臓がちょっと早く動くだけ",
        scenarioUrl: "https://www.pixiv.net/novel/show.php?id=9923582",
        scenarioOriginalName: "CoCシナリオ #1 【CoCシナリオ】心臓がちょっとはやく動くだけ",
        logs: [{
            id: "tobutori",
            name: "飛ぶ鳥お嬢様",
            iconChar: "toshiomi.png",
        }, {
            id: "wakame",
            name: "わかめお嬢様",
            iconChar: "narumi.png"
        }, {
            id: "rinse",
            name: "リンスお嬢様",
            iconChar: "rina.png"
        }, {
            id: "yata",
            name: "やたお嬢様",
            iconChar: "onomichi.png",
        }, {
            id: "manda",
            name: "まんだお嬢様",
            iconChar: "aikawa.png"
        }, {
            id: "narita",
            name: "なりたお嬢様",
            iconChar: "nakamachi.png",
        }],
        arts: [
            "image0.png", "image1.png", "image2.png", "image3.png",
        ],
    },
];

function App() {
    const title = "感情ドリンクバー";
    return (
        <Router>
            <Route exact path="/">
                <RootPage appBarTitle={title} scenarioLogs={scenarioLogs} />
            </Route>
            {scenarioLogs.map(scenarioLog => (
                <Route exact path={`/${scenarioLog.id}`}>
                    <ScenarioPage appBarTitle={title} scenarioLog={scenarioLog} />
                </Route>
            ))}
        </Router>
    );
}

export default App;
