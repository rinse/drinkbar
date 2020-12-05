import StickyAppBar from "./StickyAppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import React, {PropsWithChildren} from "react";
import {createStyles, makeStyles, Theme} from "@material-ui/core";

type MyAppBarProps = PropsWithChildren<{
}>;

export const useAppBarStyles = makeStyles((theme: Theme) => createStyles({
    appBar: {
        width: '100%',
        backgroundColor: "#20232a",
    },
    title: {
        color: theme.palette.getContrastText("#20232a"),
        flexGrow: 1,
    },
}));

export default function MyAppBar(props: MyAppBarProps) {
    const classes = useAppBarStyles();
    const {children} = props;
    return (
        <StickyAppBar className={classes.appBar}>
            <Toolbar>
                <Breadcrumbs className={classes.title}>
                    {children}
                </Breadcrumbs>
            </Toolbar>
        </StickyAppBar>
    );
}
