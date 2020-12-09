import React from "react";
import Link from "@material-ui/core/Link";
import Container from "@material-ui/core/Container";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import {MenuBook} from "@material-ui/icons";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import ScenarioLog from "../ScenarioLog";
import MyAppBar from "./MyAppBar";
import GridListTile from "@material-ui/core/GridListTile";
import Square from "./Square";
import Image from "./Image";
import GridListResponsive from "./GridListResponsive";

interface Props {
    appBarTitle: string
    scenarioLog: ScenarioLog
}

export default function ScenarioPage(props: Props) {
    const {appBarTitle, scenarioLog} = props;
    const pubScenario = `${process.env.PUBLIC_URL}/${scenarioLog.id}`;
    const pubIcons = `${process.env.PUBLIC_URL}/icons`;
    return (
        <>
            <MyAppBar>
                <Link href="/" color="inherit" underline="none">{appBarTitle}</Link>
                <Link href={`/${scenarioLog.id}`} color="inherit" underline="none">{scenarioLog.name}</Link>
            </MyAppBar>
            <Container>
                <List component="nav">
                    <ListItem button component="a" href={scenarioLog.scenarioUrl} target="_blank">
                        <ListItemIcon>
                            <MenuBook />
                        </ListItemIcon>
                        <ListItemText primary={scenarioLog.scenarioOriginalName} />
                    </ListItem>
                    {scenarioLog.logs.map(log => (
                        <ListItem button component="a" key={log.id} href={`${pubScenario}/${log.id}.html`}>
                            <ListItemIcon>
                                <Avatar src={`${pubIcons}/${log.iconChar}`} />
                            </ListItemIcon>
                            <ListItemText primary={log.name}/>
                        </ListItem>
                    ))}
                </List>
                <GridListResponsive rCols={{xs:2, sm:3}} cellHeight={'auto'}>
                    {scenarioLog.arts.map(art => (
                        <GridListTile key={art} cols={1} rows={1}>
                            <Square>
                                <Image src={`${pubScenario}/gallery/${art}`} alt={art} />
                            </Square>
                        </GridListTile>
                    ))}
                </GridListResponsive>
            </Container>
        </>
    );
}
