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
import MyAppBar from "./MyAppBar";
import ScenariosMeta from '../ScenariosMeta'

interface Props {
    appBarTitle: string
    scenarioMeta: ScenariosMeta[]
}

export default function RootPage(props: Props) {
    const theme = useTheme();
    const {appBarTitle, scenarioMeta} = props;
    return (
        <>
            <MyAppBar>
                <Link href="/" color="inherit" underline="none">{appBarTitle}</Link>
            </MyAppBar>
            <Container>
                <Box margin={theme.spacing(1)}>
                    <Typography>わー鯖の身内用のシナリオログ置き場です。</Typography>
                    <Typography>自分がまだプレイしていないシナリオのログを読まないよう気を付けてください。</Typography>
                </Box>
                <List component="nav">
                    {scenarioMeta.map(meta=> (
                        <ListItem button component="a" href={`/${meta.id}`} key={meta.id}>
                            <ListItemIcon>
                                <FolderIcon />
                            </ListItemIcon>
                            <ListItemText>{meta.name}</ListItemText>
                        </ListItem>
                    ))}
                </List>
            </Container>
        </>
    );
}
