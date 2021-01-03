import React from "react";
import Link from "@material-ui/core/Link";
import Container from "@material-ui/core/Container";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import {MenuBook} from "@material-ui/icons";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import MyAppBar from "./MyAppBar";
import GridListTile from "@material-ui/core/GridListTile";
import Square from "./Square";
import Image from "./Image";
import GridListResponsive from "./GridListResponsive";
import ScenariosMeta from '../ScenariosMeta'
import ScenarioMeta from '../ScenarioMeta'

interface Props {
    appBarTitle: string
    scenariosMeta: ScenariosMeta
    scenarioMeta: ScenarioMeta
}

export default function ScenarioPage(props: Props) {
    const {appBarTitle, scenariosMeta, scenarioMeta} = props;
    // TODO: replace with resources in s3
    const pubScenario = `${process.env.PUBLIC_URL}/scenarios/${scenariosMeta.id}`;
    const pubIcons = `${process.env.PUBLIC_URL}/scenarios/${scenariosMeta.id}/icons`;
    return (
        <>
            <MyAppBar>
                <Link href="/" color="inherit" underline="none">{appBarTitle}</Link>
                <Link href={`/${scenariosMeta.id}`} color="inherit" underline="none">{scenariosMeta.name}</Link>
            </MyAppBar>
            <Container>
                <List component="nav">
                    <ListItem button component="a" href={scenariosMeta.scenarioUrl} target="_blank">
                        <ListItemIcon>
                            <MenuBook />
                        </ListItemIcon>
                        <ListItemText primary={scenariosMeta.scenarioOriginalName} />
                    </ListItem>
                    {scenarioMeta.logs.map(log => (
                        <ListItem button component="a" key={log.id} href={`${pubScenario}/logs/${log.id}.html`}>
                            <ListItemIcon>
                                <Avatar src={`${pubIcons}/${log.icon}`} />
                            </ListItemIcon>
                            <ListItemText primary={log.name}/>
                        </ListItem>
                    ))}
                </List>
                <GridListResponsive rCols={{xs:2, sm:3}} cellHeight={'auto'}>
                    {scenarioMeta.images.map(image => (
                        <GridListTile key={image} cols={1} rows={1}>
                            <Square>
                                <Image src={`${pubScenario}/images/${image}`} alt={image} />
                            </Square>
                        </GridListTile>
                    ))}
                </GridListResponsive>
            </Container>
        </>
    );
}
