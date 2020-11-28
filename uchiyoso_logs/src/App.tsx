import React from 'react';
import {AppBar, createStyles, makeStyles} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Container from "@material-ui/core/Container";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import {BrowserRouter as Router, Route} from "react-router-dom";

const useStyles = makeStyles(() =>
    createStyles({
        appBar: {
            width: '100%',
            backgroundColor: "#20232a",
        },
        title: {
            color: "#ffffff",
            flexGrow: 1,
        },
        element: {
            color: "#ffffff",
        },
        selected: {
            color: "#61dafb",
        },
    }),
);

function App() {
    const classes = useStyles();
    return (
        <Box>
            <Router>
                <Route exact path="/">
                    <AppBar position="sticky" className={classes.appBar}>
                        <Toolbar>
                            <Breadcrumbs className={classes.title}>
                                <Link href="/" color="inherit" underline="none">身内用感情ドリンクバー</Link>
                            </Breadcrumbs>
                        </Toolbar>
                    </AppBar>
                    <Container>
                        <List component="nav">
                            <ListItem button component="a" href="/shinhaya">心臓がちょっと早く動くだけ</ListItem>
                        </List>
                    </Container>
                </Route>
                <Route exact path="/shinhaya">
                    <AppBar position="sticky" className={classes.appBar}>
                        <Toolbar>
                            <Breadcrumbs className={classes.title}>
                                <Link href="/" color="inherit" underline="none">身内用感情ドリンクバー</Link>
                                <Link href="/shinhaya" color="inherit" underline="none">心臓がちょっと早く動くだけ</Link>
                            </Breadcrumbs>
                        </Toolbar>
                    </AppBar>
                    <Container>
                        <List component="nav">
                            <ListItem button component="a" href={process.env.PUBLIC_URL + "/yata.html"}>
                                <ListItemText primary="やたお嬢様"/>
                            </ListItem>
                            <ListItem button component="a" href={process.env.PUBLIC_URL + "/manda.html"}>
                                <ListItemText primary="まんだお嬢様"/>
                            </ListItem>
                            <ListItem button component="a" href={process.env.PUBLIC_URL + "/tobutori.html"}>
                                <ListItemText primary="飛ぶ鳥お嬢様"/>
                            </ListItem>
                            <ListItem button component="a" href={process.env.PUBLIC_URL + "/wakame.html"}>
                                <ListItemText primary="わかめお嬢様"/>
                            </ListItem>
                            <ListItem button component="a" href={process.env.PUBLIC_URL + "/rinse.html"}>
                                <ListItemText primary="リンスお嬢様"/>
                            </ListItem>
                        </List>
                    </Container>
                </Route>
            </Router>
        </Box>
    );
}

export default App;
