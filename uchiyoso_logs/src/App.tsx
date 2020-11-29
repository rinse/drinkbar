import React from 'react';
import {AppBar, createStyles, makeStyles, Theme} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Toolbar from "@material-ui/core/Toolbar";
import Link from "@material-ui/core/Link";
import Container from "@material-ui/core/Container";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import {BrowserRouter as Router, Route} from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import {MenuBook} from "@material-ui/icons";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import Avatar from "@material-ui/core/Avatar";
import FolderIcon from "@material-ui/icons/Folder";
import useTheme from "@material-ui/core/styles/useTheme";
import StickyAppBar from "./components/StickyAppBar";

const useStyles = makeStyles((theme: Theme) => createStyles({
    appBar: {
        width: '100%',
        backgroundColor: "#20232a",
    },
    title: {
        color: theme.palette.getContrastText("#20232a"),
        flexGrow: 1,
    },
}));

const data = [
    {
        id: "shinhaya",
        name: "心臓がちょっと早く動くだけ",
        scenarioUrl: "https://www.pixiv.net/novel/show.php?id=9923582",
        scenarioOriginalName: "CoCシナリオ #1 【CoCシナリオ】心臓がちょっとはやく動くだけ",
        logs: [{
            id: "yata",
            name: "やたお嬢様",
            iconChar: "onomichi.png",
        }, {
            id: "manda",
            name: "まんだお嬢様",
            iconChar: "aikawa.png"
        }, {
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
            id: "narita",
            name: "なりたお嬢様",
            iconChar: "nakamachi.png",
        }],
    }
];

function App() {
    const classes = useStyles();
    const theme = useTheme();
    const title = "感情ドリンクバー";
    return (
        <Router>
            <Route exact path="/">
                <StickyAppBar className={classes.appBar}>
                    <Toolbar>
                        <Breadcrumbs className={classes.title}>
                            <Link href="/" color="inherit" underline="none">{title}</Link>
                        </Breadcrumbs>
                    </Toolbar>
                </StickyAppBar>
                <Container>
                    <Box margin={theme.spacing(1)}>
                        <Typography>わー鯖の身内用のシナリオログ置き場です。</Typography>
                        <Typography>自分がまだプレイしていないシナリオのログを読まないよう気を付けてください。</Typography>
                    </Box>
                    <List component="nav">
                        {data.map(scenario => (
                            <ListItem button component="a" href={`/${scenario.id}`}>
                                <ListItemIcon>
                                    <FolderIcon />
                                </ListItemIcon>
                                <ListItemText>{scenario.name}</ListItemText>
                            </ListItem>
                        ))}
                    </List>
                </Container>
            </Route>
            {data.map(scenario => {
                const pubScenario = `${process.env.PUBLIC_URL}/${scenario.id}`;
                const pubIcons = `${process.env.PUBLIC_URL}/icons`;
                return (
                    <Route exact path={`/${scenario.id}`}>
                        <StickyAppBar className={classes.appBar}>
                            <Toolbar>
                                <Breadcrumbs className={classes.title}>
                                    <Link href="/" color="inherit" underline="none">{title}</Link>
                                    <Link href={`/${scenario.id}`} color="inherit" underline="none">{scenario.name}</Link>
                                </Breadcrumbs>
                            </Toolbar>
                        </StickyAppBar>
                        <Container>
                            <List component="nav">
                                <ListItem button component="a" href={scenario.scenarioUrl} target="_blank">
                                    <ListItemIcon>
                                        <MenuBook />
                                    </ListItemIcon>
                                    <ListItemText primary={scenario.scenarioOriginalName} />
                                </ListItem>
                                {scenario.logs.map(log => (
                                    <ListItem button component="a" href={`${pubScenario}/${log.id}.html`}>
                                        <ListItemIcon>
                                            <Avatar src={`${pubIcons}/${log.iconChar}`} />
                                        </ListItemIcon>
                                        <ListItemText primary={log.name}/>
                                    </ListItem>
                                ))}
                            </List>
                        </Container>
                    </Route>
                );
            })}
        </Router>
    );
}

export default App;
