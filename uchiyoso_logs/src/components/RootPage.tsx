import StickyAppBar from "./StickyAppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import FolderIcon from "@material-ui/icons/Folder";
import ListItemText from "@material-ui/core/ListItemText";
import React from "react";
import useTheme from "@material-ui/core/styles/useTheme";
import {useAppBarStyles} from "../Styles";
import ScenarioLog from "../ScenarioLog";

interface Props {
    appBarTitle: string
    scenarioLogs: ScenarioLog[]
}

export default function RootPage(props: Props) {
    const theme = useTheme();
    const classes = useAppBarStyles();
    const {appBarTitle, scenarioLogs} = props;
    return (
        <>
            <StickyAppBar className={classes.appBar}>
                <Toolbar>
                    <Breadcrumbs className={classes.title}>
                        <Link href="/" color="inherit" underline="none">{appBarTitle}</Link>
                    </Breadcrumbs>
                </Toolbar>
            </StickyAppBar>
            <Container>
                <Box margin={theme.spacing(1)}>
                    <Typography>わー鯖の身内用のシナリオログ置き場です。</Typography>
                    <Typography>自分がまだプレイしていないシナリオのログを読まないよう気を付けてください。</Typography>
                </Box>
                <List component="nav">
                    {scenarioLogs.map(scenario => (
                        <ListItem button component="a" href={`/${scenario.id}`}>
                            <ListItemIcon>
                                <FolderIcon />
                            </ListItemIcon>
                            <ListItemText>{scenario.name}</ListItemText>
                        </ListItem>
                    ))}
                </List>
            </Container>
        </>
    );
}
